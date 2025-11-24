# Firestore Database Integration - Design Document

## Overview

This document outlines the technical design for integrating Google Cloud Firestore into GeoCities AI, replacing the current in-memory storage with a persistent, scalable NoSQL database.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│  React Frontend │
│   (Port 5173)   │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  Express API    │
│   (Port 3000)   │
└────────┬────────┘
         │
         ├─────────────────┬──────────────┐
         │                 │              │
         ▼                 ▼              ▼
┌─────────────────┐  ┌──────────────┐  ┌──────────────┐
│  Firebase Admin │  │  Gemini API  │  │  In-Memory   │
│  SDK            │  │  (External)  │  │  Cache       │
└────────┬────────┘  └──────────────┘  └──────────────┘
         │
         ▼
┌─────────────────┐
│  Cloud Firestore│
│  (Google Cloud) │
└─────────────────┘
```

## Database Schema

### Collections Structure

```
firestore/
├── cities/                          # Root collection
│   ├── {cityId}/                    # Auto-generated document ID
│   │   ├── id: string               # Document ID (redundant for convenience)
│   │   ├── name: string             # Display name (e.g., "Silicon Valley")
│   │   ├── nameSlug: string         # Normalized slug (e.g., "silicon-valley")
│   │   ├── theme: string            # City theme (e.g., "tech")
│   │   ├── vibe: string             # City vibe (e.g., "futuristic")
│   │   ├── createdAt: Timestamp     # Creation timestamp
│   │   ├── updatedAt: Timestamp     # Last update timestamp
│   │   │
│   │   ├── content/                 # Subcollection for pages
│   │   │   ├── {contentId}/
│   │   │   │   ├── id: string
│   │   │   │   ├── title: string
│   │   │   │   ├── body: string
│   │   │   │   ├── type: string
│   │   │   │   ├── createdAt: Timestamp
│   │   │
│   │   └── aiGenerations/           # Subcollection for cached AI content
│   │       ├── {generationId}/
│   │       │   ├── type: string     # "publicSquare" | "radio" | "newsletter"
│   │       │   ├── content: string  # Generated text
│   │       │   ├── generatedAt: Timestamp
│   │       │   ├── expiresAt: Timestamp
```

### Indexes

**Composite Indexes:**
```javascript
// For duplicate checking and listing
cities: {
  nameSlug: 'asc',
  createdAt: 'desc'
}

// For theme-based queries
cities: {
  theme: 'asc',
  createdAt: 'desc'
}
```

**Single Field Indexes:**
- `cities.nameSlug` (for unique constraint checking)
- `cities.createdAt` (for sorting)
- `cities.theme` (for filtering)

## Data Models

### City Document

```typescript
interface City {
  id: string;                    // Auto-generated Firestore ID
  name: string;                  // "Silicon Valley"
  nameSlug: string;              // "silicon-valley" (lowercase, hyphenated)
  theme: string;                 // "tech"
  vibe: string;                  // "futuristic"
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}
```

### Content Document

```typescript
interface Content {
  id: string;
  title: string;
  body: string;
  type: 'page' | 'post';
  createdAt: FirebaseFirestore.Timestamp;
}
```

### AI Generation Document

```typescript
interface AIGeneration {
  id: string;
  type: 'publicSquare' | 'radio' | 'newsletter';
  content: string;
  generatedAt: FirebaseFirestore.Timestamp;
  expiresAt: FirebaseFirestore.Timestamp;  // generatedAt + 24 hours
}
```

## Implementation Details

### Firebase Admin SDK Setup

**Installation:**
```bash
npm install firebase-admin
```

**Initialization (backend/config/firebase.js):**
```javascript
import admin from 'firebase-admin';

// Parse service account from environment variable
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT || '{}'
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID
});

export const db = admin.firestore();
```

### Slug Generation

**Utility Function (backend/utils/slug.js):**
```javascript
export function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')  // Remove special chars
    .replace(/\s+/g, '-')       // Replace spaces with hyphens
    .replace(/-+/g, '-');       // Remove duplicate hyphens
}
```

### Duplicate Checking

**Check for Duplicate City:**
```javascript
async function checkDuplicateCity(name) {
  const slug = generateSlug(name);
  const snapshot = await db.collection('cities')
    .where('nameSlug', '==', slug)
    .limit(1)
    .get();
  
  return !snapshot.empty;
}
```

**Check Theme Popularity:**
```javascript
async function getThemeCount(theme) {
  const snapshot = await db.collection('cities')
    .where('theme', '==', theme.toLowerCase())
    .count()
    .get();
  
  return snapshot.data().count;
}
```

### City Controller Updates

**Create City with Validation:**
```javascript
export const createCity = async (req, res) => {
  try {
    const { name, theme, vibe } = req.body;
    
    // Validate input
    if (!name || !theme || !vibe) {
      return res.status(400).json({ 
        error: 'Name, theme, and vibe are required' 
      });
    }
    
    // Check for duplicate
    const slug = generateSlug(name);
    const isDuplicate = await checkDuplicateCity(name);
    
    if (isDuplicate) {
      return res.status(409).json({ 
        error: `A city named "${name}" already exists. Please choose a different name.`,
        suggestions: [
          `${name} 2`,
          `New ${name}`,
          `${name} District`
        ]
      });
    }
    
    // Check theme popularity
    const themeCount = await getThemeCount(theme);
    let warning = null;
    
    if (themeCount >= 3) {
      warning = `There are already ${themeCount} cities with the "${theme}" theme. Consider making yours unique!`;
    }
    
    // Create city document
    const cityRef = db.collection('cities').doc();
    const now = admin.firestore.Timestamp.now();
    
    const cityData = {
      id: cityRef.id,
      name,
      nameSlug: slug,
      theme: theme.toLowerCase(),
      vibe,
      createdAt: now,
      updatedAt: now
    };
    
    await cityRef.set(cityData);
    
    res.status(201).json({
      ...cityData,
      warning
    });
  } catch (error) {
    console.error('Error creating city:', error);
    res.status(500).json({ error: 'Failed to create city' });
  }
};
```

**Get All Cities:**
```javascript
export const getCities = async (req, res) => {
  try {
    const snapshot = await db.collection('cities')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();
    
    const cities = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      cities.push({
        id: doc.id,
        name: data.name,
        theme: data.theme,
        vibe: data.vibe,
        pages: []  // TODO: Count subcollection
      });
    });
    
    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
};
```

**Get Single City:**
```javascript
export const getCity = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('cities').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'City not found' });
    }
    
    const data = doc.data();
    
    // Get content count
    const contentSnapshot = await doc.ref.collection('content').count().get();
    
    res.json({
      id: doc.id,
      name: data.name,
      theme: data.theme,
      vibe: data.vibe,
      pages: []  // TODO: Fetch actual content
    });
  } catch (error) {
    console.error('Error fetching city:', error);
    res.status(500).json({ error: 'Failed to fetch city' });
  }
};
```

### AI Generation Caching

**Save AI Generation:**
```javascript
async function saveAIGeneration(cityId, type, content) {
  const cityRef = db.collection('cities').doc(cityId);
  const generationRef = cityRef.collection('aiGenerations').doc();
  
  const now = admin.firestore.Timestamp.now();
  const expiresAt = admin.firestore.Timestamp.fromMillis(
    now.toMillis() + (24 * 60 * 60 * 1000)  // 24 hours
  );
  
  await generationRef.set({
    id: generationRef.id,
    type,
    content,
    generatedAt: now,
    expiresAt
  });
}
```

**Get Cached AI Generation:**
```javascript
async function getCachedAIGeneration(cityId, type) {
  const cityRef = db.collection('cities').doc(cityId);
  const now = admin.firestore.Timestamp.now();
  
  const snapshot = await cityRef.collection('aiGenerations')
    .where('type', '==', type)
    .where('expiresAt', '>', now)
    .orderBy('expiresAt', 'desc')
    .limit(1)
    .get();
  
  if (snapshot.empty) {
    return null;
  }
  
  return snapshot.docs[0].data().content;
}
```

### Migration Script

**Migrate In-Memory Data (backend/scripts/migrate.js):**
```javascript
import admin from 'firebase-admin';
import { generateSlug } from '../utils/slug.js';

const cities = [
  { name: 'Silicon Valley', theme: 'tech', vibe: 'futuristic' },
  { name: 'Sunset Boulevard', theme: 'art', vibe: 'creative' },
  { name: 'Neon District', theme: 'cyberpunk', vibe: 'edgy' }
];

async function migrate() {
  const db = admin.firestore();
  const batch = db.batch();
  
  for (const city of cities) {
    const cityRef = db.collection('cities').doc();
    const now = admin.firestore.Timestamp.now();
    
    batch.set(cityRef, {
      id: cityRef.id,
      name: city.name,
      nameSlug: generateSlug(city.name),
      theme: city.theme.toLowerCase(),
      vibe: city.vibe,
      createdAt: now,
      updatedAt: now
    });
  }
  
  await batch.commit();
  console.log('Migration complete!');
}

migrate().catch(console.error);
```

## Environment Configuration

**.env.example:**
```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}

# Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Server
PORT=3000
```

**Service Account Setup:**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download JSON file
4. Minify JSON and set as environment variable

## Error Handling

**Error Response Format:**
```typescript
interface ErrorResponse {
  error: string;           // Human-readable error message
  code?: string;           // Error code (e.g., 'DUPLICATE_CITY')
  suggestions?: string[];  // Alternative suggestions
  warning?: string;        // Non-blocking warnings
}
```

**Error Codes:**
- `DUPLICATE_CITY`: City name already exists
- `INVALID_INPUT`: Missing or invalid fields
- `NOT_FOUND`: City not found
- `PERMISSION_DENIED`: Firestore permission error
- `INTERNAL_ERROR`: Unexpected server error

## Performance Optimization

### Caching Strategy

**In-Memory Cache (Optional):**
```javascript
import NodeCache from 'node-cache';

const cityCache = new NodeCache({ 
  stdTTL: 300,  // 5 minutes
  checkperiod: 60 
});

export const getCitiesWithCache = async (req, res) => {
  const cacheKey = 'all_cities';
  const cached = cityCache.get(cacheKey);
  
  if (cached) {
    return res.json(cached);
  }
  
  // Fetch from Firestore
  const cities = await fetchCitiesFromFirestore();
  cityCache.set(cacheKey, cities);
  
  res.json(cities);
};
```

### Query Optimization

- Use `.limit()` on all queries
- Implement pagination for large datasets
- Use composite indexes for complex queries
- Cache frequently accessed data
- Use `.count()` instead of fetching all documents

## Security Considerations

### Input Validation

```javascript
function validateCityInput(name, theme, vibe) {
  const errors = [];
  
  if (!name || name.length < 3 || name.length > 50) {
    errors.push('Name must be between 3 and 50 characters');
  }
  
  if (!theme || theme.length < 3 || theme.length > 30) {
    errors.push('Theme must be between 3 and 30 characters');
  }
  
  if (!vibe || vibe.length < 3 || vibe.length > 30) {
    errors.push('Vibe must be between 3 and 30 characters');
  }
  
  // Prevent XSS
  const dangerousChars = /<script|javascript:|onerror=/i;
  if (dangerousChars.test(name) || dangerousChars.test(theme) || dangerousChars.test(vibe)) {
    errors.push('Invalid characters detected');
  }
  
  return errors;
}
```

### Rate Limiting

```javascript
import rateLimit from 'express-rate-limit';

const createCityLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 5,  // 5 cities per hour
  message: 'Too many cities created. Please try again later.'
});

router.post('/', createCityLimiter, createCity);
```

## Testing Strategy

### Unit Tests
- Test slug generation
- Test duplicate checking logic
- Test validation functions
- Test error handling

### Integration Tests
- Test Firestore CRUD operations
- Test duplicate prevention
- Test theme counting
- Test caching behavior

### Load Tests
- Test with 1000+ cities
- Test concurrent city creation
- Test query performance
- Test cache effectiveness

## Deployment Checklist

- [ ] Create Firebase project
- [ ] Enable Firestore database
- [ ] Generate service account key
- [ ] Set environment variables
- [ ] Create composite indexes
- [ ] Run migration script
- [ ] Test duplicate prevention
- [ ] Test error handling
- [ ] Enable Firestore backups
- [ ] Monitor query performance
- [ ] Set up logging
- [ ] Configure rate limiting
