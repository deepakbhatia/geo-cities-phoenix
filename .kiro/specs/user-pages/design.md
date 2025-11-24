# User Pages Feature - Design Document

## Overview

This document outlines the technical design for implementing user-generated pages within cities in GeoCities AI. Users will be able to create AI-generated content pages that populate their neighborhoods.

## Architecture

### Component Structure

```
frontend/src/
├── pages/
│   ├── City.jsx              # Updated with pages section
│   ├── PageDetail.jsx        # NEW: View individual page
│   └── CreatePage.jsx        # NEW: Create page form
├── components/
│   ├── PageCard.jsx          # NEW: Page preview card
│   ├── PageList.jsx          # NEW: List of pages
│   └── PageForm.jsx          # NEW: Reusable form component
```

### API Endpoints

```
GET    /api/cities/:cityId/pages          # List all pages in city
GET    /api/cities/:cityId/pages/:pageId  # Get single page
POST   /api/cities/:cityId/pages          # Create new page
PUT    /api/cities/:cityId/pages/:pageId  # Update page
DELETE /api/cities/:cityId/pages/:pageId  # Delete page
POST   /api/ai/generate-page              # Generate page content
```

## Data Models

### Page Model

```typescript
interface Page {
  id: string;                    // Auto-generated ID
  cityId: string;                // Parent city reference
  title: string;                 // "My Awesome Homepage"
  titleSlug: string;             // "my-awesome-homepage"
  type: PageType;                // Page category
  prompt: string;                // User's original prompt
  content: string;               // AI-generated content
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last update timestamp
}

enum PageType {
  PERSONAL = 'personal',
  FAN_SITE = 'fan-site',
  BUSINESS = 'business',
  BLOG = 'blog',
  ART_GALLERY = 'art-gallery',
  MUSIC = 'music',
  GAMING = 'gaming',
  COMMUNITY = 'community'
}
```

### Database Schema (Firestore)

```
cities/{cityId}/pages/{pageId}
  ├── id: string
  ├── cityId: string
  ├── title: string
  ├── titleSlug: string
  ├── type: string
  ├── prompt: string
  ├── content: string
  ├── createdAt: Timestamp
  └── updatedAt: Timestamp
```

## Backend Implementation

### Content Controller (backend/controllers/contentController.js)

```javascript
import { db } from '../config/firebase.js';
import { generateSlug } from '../utils/slug.js';
import admin from 'firebase-admin';

// Get all pages for a city
export const getPages = async (req, res) => {
  try {
    const { cityId } = req.params;
    
    // Verify city exists
    const cityDoc = await db.collection('cities').doc(cityId).get();
    if (!cityDoc.exists) {
      return res.status(404).json({ error: 'City not found' });
    }
    
    // Get pages
    const snapshot = await db.collection('cities')
      .doc(cityId)
      .collection('pages')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();
    
    const pages = [];
    snapshot.forEach(doc => {
      pages.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
};

// Get single page
export const getPage = async (req, res) => {
  try {
    const { cityId, pageId } = req.params;
    
    const doc = await db.collection('cities')
      .doc(cityId)
      .collection('pages')
      .doc(pageId)
      .get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ error: 'Failed to fetch page' });
  }
};

// Create new page
export const createPage = async (req, res) => {
  try {
    const { cityId } = req.params;
    const { title, type, prompt } = req.body;
    
    // Validate input
    if (!title || !type || !prompt) {
      return res.status(400).json({ 
        error: 'Title, type, and prompt are required' 
      });
    }
    
    if (title.length < 3 || title.length > 100) {
      return res.status(400).json({ 
        error: 'Title must be between 3 and 100 characters' 
      });
    }
    
    if (prompt.length < 10 || prompt.length > 500) {
      return res.status(400).json({ 
        error: 'Prompt must be between 10 and 500 characters' 
      });
    }
    
    // Verify city exists
    const cityDoc = await db.collection('cities').doc(cityId).get();
    if (!cityDoc.exists) {
      return res.status(404).json({ error: 'City not found' });
    }
    
    const cityData = cityDoc.data();
    
    // Check for duplicate title
    const slug = generateSlug(title);
    const duplicateCheck = await db.collection('cities')
      .doc(cityId)
      .collection('pages')
      .where('titleSlug', '==', slug)
      .limit(1)
      .get();
    
    if (!duplicateCheck.empty) {
      return res.status(409).json({ 
        error: 'A page with this title already exists in this city' 
      });
    }
    
    // Check page limit
    const pageCount = await db.collection('cities')
      .doc(cityId)
      .collection('pages')
      .count()
      .get();
    
    if (pageCount.data().count >= 100) {
      return res.status(400).json({ 
        error: 'This city has reached its page limit (100 pages)' 
      });
    }
    
    // Generate content with AI (will be implemented in AI controller)
    const content = await generatePageContent({
      cityName: cityData.name,
      theme: cityData.theme,
      vibe: cityData.vibe,
      pageTitle: title,
      pageType: type,
      prompt
    });
    
    // Create page document
    const pageRef = db.collection('cities')
      .doc(cityId)
      .collection('pages')
      .doc();
    
    const now = admin.firestore.Timestamp.now();
    
    const pageData = {
      id: pageRef.id,
      cityId,
      title,
      titleSlug: slug,
      type,
      prompt,
      content,
      createdAt: now,
      updatedAt: now
    };
    
    await pageRef.set(pageData);
    
    res.status(201).json(pageData);
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ error: 'Failed to create page' });
  }
};

// Update page
export const updatePage = async (req, res) => {
  try {
    const { cityId, pageId } = req.params;
    const { title, prompt } = req.body;
    
    const pageRef = db.collection('cities')
      .doc(cityId)
      .collection('pages')
      .doc(pageId);
    
    const doc = await pageRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    const updates = {
      updatedAt: admin.firestore.Timestamp.now()
    };
    
    if (title) {
      updates.title = title;
      updates.titleSlug = generateSlug(title);
    }
    
    if (prompt) {
      // Regenerate content with new prompt
      const cityDoc = await db.collection('cities').doc(cityId).get();
      const cityData = cityDoc.data();
      
      updates.prompt = prompt;
      updates.content = await generatePageContent({
        cityName: cityData.name,
        theme: cityData.theme,
        vibe: cityData.vibe,
        pageTitle: title || doc.data().title,
        pageType: doc.data().type,
        prompt
      });
    }
    
    await pageRef.update(updates);
    
    const updated = await pageRef.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ error: 'Failed to update page' });
  }
};

// Delete page
export const deletePage = async (req, res) => {
  try {
    const { cityId, pageId } = req.params;
    
    const pageRef = db.collection('cities')
      .doc(cityId)
      .collection('pages')
      .doc(pageId);
    
    const doc = await pageRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    await pageRef.delete();
    
    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ error: 'Failed to delete page' });
  }
};

// Helper function (will be moved to AI controller)
async function generatePageContent(params) {
  // This will call the Gemini API
  // Implementation in aiController.js
  return "Generated content placeholder";
}
```

### AI Controller Update (backend/controllers/aiController.js)

```javascript
// Add new function for page content generation
export const generatePageContent = async (req, res) => {
  try {
    const { cityName, theme, vibe, pageTitle, pageType, prompt } = req.body;
    
    // Build comprehensive prompt
    const aiPrompt = `You are creating content for a page in GeoCities AI.

City Context:
- City Name: ${cityName}
- Theme: ${theme}
- Vibe: ${vibe}

Page Details:
- Title: ${pageTitle}
- Type: ${pageType}
- User's Request: ${prompt}

Create engaging, creative content for this page that:
1. Matches the ${vibe} vibe of ${cityName}
2. Fits the ${theme} theme
3. Is appropriate for a ${pageType} page
4. Fulfills the user's request: "${prompt}"
5. Is 2-4 paragraphs long
6. Feels authentic to the GeoCities aesthetic

Write the content now:`;

    const result = await model.generateContent(aiPrompt);
    const response = await result.response;
    const content = response.text();
    
    res.json({
      content,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating page content:', error);
    res.status(500).json({ error: 'Failed to generate page content' });
  }
};
```

### Routes (backend/routes/content.js)

```javascript
import express from 'express';
import { 
  getPages, 
  getPage, 
  createPage, 
  updatePage, 
  deletePage 
} from '../controllers/contentController.js';

const router = express.Router();

// City pages routes
router.get('/:cityId', getPages);
router.get('/:cityId/:pageId', getPage);
router.post('/:cityId', createPage);
router.put('/:cityId/:pageId', updatePage);
router.delete('/:cityId/:pageId', deletePage);

export default router;
```

## Frontend Implementation

### Page List Component (frontend/src/components/PageList.jsx)

```jsx
import { Link } from 'react-router-dom';

function PageList({ cityId, pages }) {
  if (pages.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📄</div>
        <p className="empty-state-message">No pages yet!</p>
        <p className="empty-state-hint">Be the first to create a page in this city.</p>
      </div>
    );
  }

  return (
    <div className="page-list">
      {pages.map(page => (
        <Link 
          key={page.id} 
          to={`/city/${cityId}/page/${page.id}`}
          className="page-card"
        >
          <div className="page-type-badge">{page.type}</div>
          <h4>{page.title}</h4>
          <p className="page-excerpt">
            {page.content.substring(0, 100)}...
          </p>
          <div className="page-meta">
            <span>📅 {new Date(page.createdAt.seconds * 1000).toLocaleDateString()}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default PageList;
```

### Create Page Component (frontend/src/pages/CreatePage.jsx)

```jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

function CreatePage() {
  const { cityId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    type: 'personal',
    prompt: ''
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const pageTypes = [
    { value: 'personal', label: '🏠 Personal Homepage' },
    { value: 'fan-site', label: '⭐ Fan Site' },
    { value: 'business', label: '💼 Business Page' },
    { value: 'blog', label: '📝 Blog/Journal' },
    { value: 'art-gallery', label: '🎨 Art Gallery' },
    { value: 'music', label: '🎵 Music Page' },
    { value: 'gaming', label: '🎮 Gaming Page' },
    { value: 'community', label: '👥 Community Hub' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);

    try {
      const res = await fetch(`/api/content/${cityId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create page');
      }

      const newPage = await res.json();
      navigate(`/city/${cityId}/page/${newPage.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="create-page">
      <h2>✨ Create New Page</h2>
      
      <form onSubmit={handleSubmit} className="page-form">
        <div className="form-group">
          <label htmlFor="title">Page Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="My Awesome Homepage"
            required
            minLength={3}
            maxLength={100}
          />
          <span className="char-count">{formData.title.length}/100</span>
        </div>

        <div className="form-group">
          <label htmlFor="type">Page Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            {pageTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="prompt">What should this page be about?</label>
          <textarea
            id="prompt"
            name="prompt"
            value={formData.prompt}
            onChange={handleChange}
            placeholder="Describe what you want on this page. The AI will generate creative content based on your description and the city's theme."
            required
            minLength={10}
            maxLength={500}
            rows={5}
          />
          <span className="char-count">{formData.prompt.length}/500</span>
        </div>

        {error && <div className="error-message">❌ {error}</div>}

        {creating && (
          <LoadingSpinner message="🎨 AI is creating your page... (5-10 seconds)" />
        )}

        <button type="submit" disabled={creating} className="submit-btn">
          {creating ? 'Creating...' : '🚀 Create Page'}
        </button>
      </form>
    </div>
  );
}

export default CreatePage;
```

### Page Detail Component (frontend/src/pages/PageDetail.jsx)

```jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

function PageDetail() {
  const { cityId, pageId } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/content/${cityId}/${pageId}`)
      .then(res => {
        if (!res.ok) throw new Error('Page not found');
        return res.json();
      })
      .then(data => {
        setPage(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [cityId, pageId]);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${page.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/content/${cityId}/${pageId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete page');

      navigate(`/city/${cityId}`);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="loading">Loading page...</div>;
  if (error) return <div className="loading">{error}</div>;

  return (
    <div className="page-detail">
      <Link to={`/city/${cityId}`} className="back-link">
        ← Back to City
      </Link>

      <div className="page-header">
        <div className="page-type-badge">{page.type}</div>
        <h1>{page.title}</h1>
        <div className="page-meta">
          <span>📅 Created {new Date(page.createdAt.seconds * 1000).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="page-content">
        {page.content}
      </div>

      <div className="page-actions">
        <button onClick={handleDelete} className="delete-btn">
          🗑️ Delete Page
        </button>
      </div>
    </div>
  );
}

export default PageDetail;
```

### Update City Component (frontend/src/pages/City.jsx)

Add pages section after AI features:

```jsx
// Add to imports
import { Link } from 'react-router-dom';
import PageList from '../components/PageList';

// Add state
const [pages, setPages] = useState([]);
const [pagesLoading, setPagesLoading] = useState(true);

// Add useEffect to fetch pages
useEffect(() => {
  if (city) {
    fetch(`/api/content/${id}`)
      .then(res => res.json())
      .then(data => {
        setPages(data);
        setPagesLoading(false);
      })
      .catch(err => console.error(err));
  }
}, [city, id]);

// Add to JSX after city-features
<section className="city-pages">
  <div className="section-header">
    <h3>📄 Pages ({pages.length})</h3>
    <Link to={`/city/${id}/create-page`} className="create-page-btn">
      ✨ Create Page
    </Link>
  </div>
  {pagesLoading ? (
    <div className="loading">Loading pages...</div>
  ) : (
    <PageList cityId={id} pages={pages} />
  )}
</section>
```

## Styling

### Page Components CSS (frontend/src/App.css)

```css
/* Page List */
.city-pages {
  margin-top: var(--space-12);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
}

.create-page-btn {
  background: linear-gradient(135deg, var(--success), #27ae60);
  color: var(--text-light);
  padding: var(--space-3) var(--space-6);
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all var(--transition-base);
}

.create-page-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.page-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-6);
}

.page-card {
  background: var(--card-bg);
  padding: var(--space-6);
  border-radius: 12px;
  text-decoration: none;
  color: var(--text-primary);
  transition: all var(--transition-base);
  border: 2px solid rgba(112, 92, 83, 0.2);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.page-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  border-color: var(--public-square-accent);
}

.page-type-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  background: var(--public-square-accent);
  color: var(--text-light);
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  align-self: flex-start;
}

.page-card h4 {
  font-size: 1.3rem;
  margin: 0;
  color: var(--text-primary);
}

.page-excerpt {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
}

.page-meta {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: auto;
}

/* Page Detail */
.page-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-8);
}

.page-header {
  margin-bottom: var(--space-8);
}

.page-header h1 {
  font-size: 2.5rem;
  margin: var(--space-4) 0;
}

.page-content {
  background: var(--card-bg);
  padding: var(--space-8);
  border-radius: 12px;
  line-height: 1.8;
  font-size: 1.1rem;
  white-space: pre-wrap;
}

.page-actions {
  margin-top: var(--space-6);
  display: flex;
  gap: var(--space-4);
}

.delete-btn {
  background: var(--error);
  color: var(--text-light);
  border: none;
}

.delete-btn:hover:not(:disabled) {
  background: #c0392b;
}

/* Create Page Form */
.create-page {
  max-width: 700px;
  margin: 0 auto;
  padding: var(--space-8);
}

.page-form {
  background: var(--card-bg);
  padding: var(--space-8);
  border-radius: 12px;
}

.page-form textarea {
  width: 100%;
  padding: var(--space-3);
  border: 2px solid var(--text-secondary);
  border-radius: 8px;
  font-family: var(--font-primary);
  font-size: 1rem;
  resize: vertical;
}

.page-form textarea:focus {
  outline: none;
  border-color: var(--public-square-accent);
  box-shadow: 0 0 0 3px rgba(230, 126, 34, 0.2);
}

.char-count {
  font-size: 0.85rem;
  color: var(--text-secondary);
  float: right;
  margin-top: var(--space-1);
}
```

## Testing Checklist

- [ ] Create page with valid data
- [ ] Create page with duplicate title (should fail)
- [ ] Create page with invalid data (should show validation)
- [ ] View page list in city
- [ ] View individual page
- [ ] Delete page
- [ ] Test page limit (100 pages)
- [ ] Test AI generation with different prompts
- [ ] Test all page types
- [ ] Test mobile responsiveness
- [ ] Test error handling
- [ ] Test loading states

## Future Enhancements

- User authentication (page ownership)
- Page editing
- Page comments
- Page likes/reactions
- Page search and filtering
- Page tags
- Rich text editor
- Image uploads
- Page templates
- Page analytics
