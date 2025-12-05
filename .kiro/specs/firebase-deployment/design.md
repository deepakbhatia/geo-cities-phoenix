# Firebase Deployment - Design

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Firebase Project                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │ Firebase Hosting │         │ Cloud Functions  │          │
│  │                  │         │                  │          │
│  │  React Frontend  │────────▶│  Express API     │          │
│  │  (Static Build)  │  /api/* │  (Node.js)       │          │
│  └──────────────────┘         └──────────────────┘          │
│           │                            │                     │
│           │                            │                     │
│           ▼                            ▼                     │
│  ┌──────────────────────────────────────────────┐           │
│  │            Firestore Database                 │           │
│  │  - cities collection                          │           │
│  │  - pages collection                           │           │
│  │  - aiGenerations subcollection                │           │
│  └──────────────────────────────────────────────┘           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
                  ┌────────────────┐
                  │  Gemini API    │
                  │  (External)    │
                  └────────────────┘
```

## Component Design

### 1. Frontend Deployment (Firebase Hosting)

**Build Process:**
```bash
cd frontend
npm run build
# Output: frontend/dist/
```

**Hosting Configuration:**
```json
{
  "hosting": {
    "public": "frontend/dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

**Key Features:**
- SPA routing via rewrites to index.html
- API requests proxied to Cloud Functions
- Static asset caching (1 year for JS/CSS)
- Automatic HTTPS

### 2. Backend Deployment (Cloud Functions)

**Function Structure:**
```javascript
// functions/index.js
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

const app = express();

// CORS configuration
app.use(cors({ origin: true }));

// Import routes
const cityRoutes = require('./routes/cities');
const contentRoutes = require('./routes/content');
const aiRoutes = require('./routes/ai');

// Mount routes
app.use('/api/cities', cityRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/ai', aiRoutes);

// Export as Cloud Function
exports.api = functions
  .region('us-central1')
  .runWith({
    timeoutSeconds: 60,
    memory: '512MB'
  })
  .https.onRequest(app);
```

**Environment Variables:**
```bash
firebase functions:config:set gemini.api_key="YOUR_API_KEY"
```

**Function Configuration:**
- Region: us-central1 (default, lowest latency for US)
- Memory: 512MB (sufficient for API + AI calls)
- Timeout: 60s (for AI generation)
- Runtime: Node.js 18

### 3. Project Structure

```
geocities-ai/
├── frontend/
│   ├── dist/              # Build output (gitignored)
│   ├── src/
│   └── package.json
├── backend/               # Source code
│   ├── controllers/
│   ├── routes/
│   └── config/
├── functions/             # Cloud Functions deployment
│   ├── index.js          # Function entry point
│   ├── controllers/      # Copied from backend
│   ├── routes/           # Copied from backend
│   ├── config/           # Copied from backend
│   ├── utils/            # Copied from backend
│   └── package.json      # Functions dependencies
├── firebase.json          # Firebase configuration
├── .firebaserc           # Firebase project config
└── firestore.rules       # Security rules
```

### 4. Environment Configuration

**Frontend (.env.production):**
```env
VITE_API_URL=/api
```

**Backend (Firebase Functions Config):**
```bash
# Set via CLI
firebase functions:config:set gemini.api_key="YOUR_KEY"

# Access in code
const apiKey = functions.config().gemini.api_key;
```

### 5. Deployment Flow

```
┌─────────────────┐
│  Developer      │
│  runs deploy    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Build Frontend │
│  npm run build  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Copy Backend   │
│  to functions/  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Deploy to      │
│  Firebase       │
└────────┬────────┘
         │
         ├──────────────┐
         ▼              ▼
┌──────────────┐  ┌──────────────┐
│   Hosting    │  │  Functions   │
│   Updated    │  │   Updated    │
└──────────────┘  └──────────────┘
```

## API Routing

**Before Deployment (Development):**
```
Frontend: http://localhost:5173
Backend:  http://localhost:3000/api/*
```

**After Deployment (Production):**
```
Frontend: https://your-project.web.app
Backend:  https://your-project.web.app/api/*
         (proxied to Cloud Function)
```

## Security Considerations

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cities - read public, write authenticated (future)
    match /cities/{cityId} {
      allow read: if true;
      allow write: if false; // Disable for now
      
      // AI generations subcollection
      match /aiGenerations/{generationId} {
        allow read: if true;
        allow write: if false; // Only functions can write
      }
    }
    
    // Pages - read public, write authenticated (future)
    match /pages/{pageId} {
      allow read: if true;
      allow write: if false; // Disable for now
    }
  }
}
```

### CORS Configuration
- Allow requests from Firebase Hosting domain
- Use `cors({ origin: true })` for simplicity
- Can be restricted to specific domains later

### API Key Security
- Gemini API key stored in Functions config
- Never exposed to frontend
- Accessed via `functions.config()`

## Performance Optimization

### Frontend
- Code splitting via Vite
- Asset compression (gzip/brotli)
- CDN caching for static assets
- Lazy loading for routes

### Backend
- Function warm-up (keep-alive requests)
- Firestore query optimization
- AI response caching (24h)
- Connection pooling for Firestore

### Database
- Composite indexes for queries
- Pagination for large result sets
- Caching layer for AI generations

## Monitoring & Logging

### Cloud Functions Logs
```bash
firebase functions:log
```

### Hosting Logs
- Access via Firebase Console
- Monitor traffic and errors

### Performance Monitoring
- Firebase Performance Monitoring SDK
- Track page load times
- Monitor API response times

## Rollback Strategy

### Hosting Rollback
```bash
firebase hosting:rollback
```

### Functions Rollback
- Deploy previous version
- Keep previous code in git

### Database Rollback
- Firestore backups (manual)
- Export/import if needed

## Cost Estimation (Free Tier)

### Firebase Hosting
- 10 GB storage: ✅ Sufficient
- 360 MB/day transfer: ⚠️ Monitor usage

### Cloud Functions
- 2M invocations/month: ⚠️ Monitor usage
- 400K GB-seconds: ✅ Sufficient
- 200K CPU-seconds: ✅ Sufficient

### Firestore
- 50K reads/day: ⚠️ Monitor usage
- 20K writes/day: ✅ Sufficient
- 1 GB storage: ✅ Sufficient

### Recommendations
- Implement caching aggressively
- Monitor quotas via Firebase Console
- Consider upgrading if traffic grows
