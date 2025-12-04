# Flexible Page Creation - Design Document

## Overview

This document outlines the technical design for implementing flexible page creation with both AI-generated and user-written content options, including AI detection and proper tagging.

## Architecture Changes

### Updated Data Flow

```
User Creates Page
    ↓
Select Mode (AI Generate / Write Myself)
    ↓
    ├─ AI Generate Mode
    │   ├─ Enter Title + Prompt
    │   ├─ Submit Form
    │   ├─ Generate Content (Gemini API)
    │   ├─ Tag as "ai-generated"
    │   └─ Save Page
    │
    └─ Write Myself Mode
        ├─ Enter Title + Content
        ├─ Submit Form
        ├─ Save Page (tag as "pending")
        ├─ Run AI Detection (async)
        │   ├─ Confidence > 0.7 → "detected-ai"
        │   └─ Confidence ≤ 0.7 → "user-written"
        └─ Update Tag
```

## Database Schema Updates

### Page Document (Firestore/In-Memory)

```javascript
{
  id: "page123",
  cityId: "city456",
  title: "My Awesome Page",
  titleSlug: "my-awesome-page",
  type: "personal",
  
  // NEW FIELDS
  contentMode: "ai-generate",  // or "write-myself"
  contentTag: "ai-generated",  // or "user-written" or "detected-ai"
  aiConfidenceScore: 0.85,     // Optional, 0-1
  originalPrompt: "Create a page about...",  // Optional
  
  content: "Generated or written content...",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
}
```

### Migration Script

```javascript
// backend/scripts/migrate-pages.js
import { db } from '../config/firebase.js';

async function migratePages() {
  console.log('Starting page migration...');
  
  // Get all cities
  const citiesSnapshot = await db.collection('cities').get();
  
  let totalPages = 0;
  let migratedPages = 0;
  
  for (const cityDoc of citiesSnapshot.docs) {
    const pagesSnapshot = await cityDoc.ref
      .collection('pages')
      .get();
    
    totalPages += pagesSnapshot.size;
    
    for (const pageDoc of pagesSnapshot.docs) {
      const pageData = pageDoc.data();
      
      // Skip if already migrated
      if (pageData.contentMode) {
        console.log(`Skipping ${pageDoc.id} - already migrated`);
        continue;
      }
      
      // Update with new fields
      await pageDoc.ref.update({
        contentMode: 'ai-generate',
        contentTag: 'ai-generated',
        originalPrompt: pageData.prompt || 'Legacy page',
        aiConfidenceScore: null
      });
      
      migratedPages++;
      console.log(`Migrated page: ${pageData.title}`);
    }
  }
  
  console.log(`Migration complete: ${migratedPages}/${totalPages} pages migrated`);
}

// For in-memory storage
function migrateInMemoryPages(pages) {
  return pages.map(page => ({
    ...page,
    contentMode: page.contentMode || 'ai-generate',
    contentTag: page.contentTag || 'ai-generated',
    originalPrompt: page.originalPrompt || page.prompt || 'Legacy page',
    aiConfidenceScore: page.aiConfidenceScore || null
  }));
}

export { migratePages, migrateInMemoryPages };
```

## Backend Implementation

### Updated Content Controller

```javascript
// backend/controllers/contentController.js

export const createPage = async (req, res) => {
  try {
    const { cityId } = req.params;
    const { title, type, contentMode, prompt, content } = req.body;
    
    // Validate input
    if (!title || !type || !contentMode) {
      return res.status(400).json({ 
        error: 'Title, type, and content mode are required' 
      });
    }
    
    // Validate based on mode
    if (contentMode === 'ai-generate') {
      if (!prompt || prompt.length < 10 || prompt.length > 500) {
        return res.status(400).json({ 
          error: 'Prompt must be between 10 and 500 characters' 
        });
      }
    } else if (contentMode === 'write-myself') {
      if (!content || content.length < 50 || content.length > 5000) {
        return res.status(400).json({ 
          error: 'Content must be between 50 and 5000 characters' 
        });
      }
    } else {
      return res.status(400).json({ 
        error: 'Invalid content mode' 
      });
    }
    
    // ... existing validation (duplicate check, page limit, etc.)
    
    let finalContent;
    let contentTag;
    let aiConfidenceScore = null;
    let originalPrompt = null;
    
    if (contentMode === 'ai-generate') {
      // Generate content with AI
      finalContent = await generatePageContent({
        cityId,
        title,
        type,
        prompt
      });
      contentTag = 'ai-generated';
      originalPrompt = prompt;
    } else {
      // Use user-written content
      finalContent = content;
      contentTag = 'pending'; // Will be updated after detection
      
      // Run AI detection asynchronously
      detectAIContent(cityId, pageId, content)
        .then(result => {
          // Update page with detection results
          updatePageTag(cityId, pageId, result);
        })
        .catch(err => {
          console.error('AI detection failed:', err);
          // Default to user-written if detection fails
          updatePageTag(cityId, pageId, {
            contentTag: 'user-written',
            aiConfidenceScore: null
          });
        });
    }
    
    // Create page
    const newPage = {
      id: String(pages.length + 1),
      cityId,
      title,
      titleSlug: generateSlug(title),
      type,
      contentMode,
      contentTag,
      aiConfidenceScore,
      originalPrompt,
      content: finalContent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    pages.push(newPage);
    
    res.status(201).json(newPage);
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ error: 'Failed to create page' });
  }
};

// Helper function to update page tag after detection
async function updatePageTag(cityId, pageId, result) {
  const pageIndex = pages.findIndex(p => 
    p.id === pageId && p.cityId === cityId
  );
  
  if (pageIndex !== -1) {
    pages[pageIndex].contentTag = result.contentTag;
    pages[pageIndex].aiConfidenceScore = result.aiConfidenceScore;
    pages[pageIndex].updatedAt = new Date().toISOString();
    
    console.log(`Updated page ${pageId} tag to ${result.contentTag}`);
  }
}
```

### AI Detection Function

```javascript
// backend/controllers/aiController.js

export const detectAIContent = async (cityId, pageId, content) => {
  try {
    const prompt = `Analyze the following text and determine if it was likely generated by an AI language model.

Consider these indicators:
1. Overly formal or structured language
2. Lack of personal anecdotes or specific details
3. Generic or templated phrasing
4. Perfect grammar and punctuation
5. Balanced, neutral tone without strong opinions
6. Repetitive sentence structures
7. Lack of colloquialisms or informal language

Text to analyze:
"""
${content}
"""

Respond with ONLY a JSON object in this exact format:
{
  "isAiGenerated": true,
  "confidence": 0.85,
  "reasoning": "brief explanation"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    // Determine tag based on confidence
    const contentTag = analysis.confidence > 0.7 ? 'detected-ai' : 'user-written';
    
    return {
      contentTag,
      aiConfidenceScore: analysis.confidence,
      reasoning: analysis.reasoning
    };
  } catch (error) {
    console.error('Error detecting AI content:', error);
    // Default to user-written on error
    return {
      contentTag: 'user-written',
      aiConfidenceScore: null,
      reasoning: 'Detection failed'
    };
  }
};

// Export for use in content controller
export { detectAIContent };
```

## Frontend Implementation

### Updated CreatePage Component

```jsx
// frontend/src/pages/CreatePage.jsx

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

function CreatePage() {
  const { cityId } = useParams();
  const navigate = useNavigate();
  const [contentMode, setContentMode] = useState('ai-generate');
  const [formData, setFormData] = useState({
    title: '',
    type: 'personal',
    prompt: '',
    content: ''
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
      const payload = {
        title: formData.title,
        type: formData.type,
        contentMode
      };

      if (contentMode === 'ai-generate') {
        payload.prompt = formData.prompt;
      } else {
        payload.content = formData.content;
      }

      const res = await fetch(`/api/content/${cityId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create page');
      }

      const newPage = await res.json();
      navigate(`/city/${cityId}/page/${newPage.id}`);
    } catch (err) {
      setError(err.message);
      setCreating(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleModeChange = (mode) => {
    setContentMode(mode);
    setError('');
  };

  return (
    <div className="create-page-container">
      <Link to={`/city/${cityId}`} className="back-link">
        ← Back to City
      </Link>

      <div className="create-page">
        <h2>✨ Create New Page</h2>
        
        {/* Content Mode Selection */}
        <div className="content-mode-selector">
          <h3>How would you like to create your page?</h3>
          <div className="mode-options">
            <button
              type="button"
              className={`mode-option ${contentMode === 'ai-generate' ? 'active' : ''}`}
              onClick={() => handleModeChange('ai-generate')}
            >
              <span className="mode-icon">🤖</span>
              <span className="mode-title">AI Generate</span>
              <span className="mode-desc">Describe what you want, AI creates it</span>
            </button>
            <button
              type="button"
              className={`mode-option ${contentMode === 'write-myself' ? 'active' : ''}`}
              onClick={() => handleModeChange('write-myself')}
            >
              <span className="mode-icon">✍️</span>
              <span className="mode-title">Write Myself</span>
              <span className="mode-desc">Write your own content manually</span>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="page-form">
          <div className="form-group">
            <label htmlFor="title">Page Title *</label>
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
              disabled={creating}
            />
            <span className="char-count">{formData.title.length}/100</span>
          </div>

          <div className="form-group">
            <label htmlFor="type">Page Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              disabled={creating}
            >
              {pageTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {contentMode === 'ai-generate' ? (
            <div className="form-group">
              <label htmlFor="prompt">What should this page be about? *</label>
              <textarea
                id="prompt"
                name="prompt"
                value={formData.prompt}
                onChange={handleChange}
                placeholder="Describe what you want on this page. Example: 'A personal homepage about my love for retro gaming, featuring my favorite 90s games and memories.'"
                required
                minLength={10}
                maxLength={500}
                rows={6}
                disabled={creating}
              />
              <span className="char-count">{formData.prompt.length}/500</span>
              <p className="field-hint">
                💡 Be specific! The AI will create content based on your description and the city's theme.
              </p>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="content">Page Content *</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Write your page content here. You can use multiple paragraphs. Be creative and authentic!"
                required
                minLength={50}
                maxLength={5000}
                rows={12}
                disabled={creating}
              />
              <span className="char-count">{formData.content.length}/5000</span>
              <p className="field-hint">
                ℹ️ Your content will be analyzed to detect if it's AI-generated and tagged accordingly.
              </p>
            </div>
          )}

          {error && <div className="error-message">❌ {error}</div>}

          {creating && (
            <LoadingSpinner 
              message={contentMode === 'ai-generate' 
                ? "🎨 AI is creating your page... (5-10 seconds)" 
                : "💾 Saving your page..."
              } 
            />
          )}

          <button type="submit" disabled={creating} className="submit-btn">
            {creating ? 'Creating...' : '🚀 Create Page'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePage;
```

### Updated PageList Component (with tags)

```jsx
// frontend/src/components/PageList.jsx

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

  const getPageTypeLabel = (type) => {
    const types = {
      'personal': '🏠 Personal',
      'fan-site': '⭐ Fan Site',
      'business': '💼 Business',
      'blog': '📝 Blog',
      'art-gallery': '🎨 Art',
      'music': '🎵 Music',
      'gaming': '🎮 Gaming',
      'community': '👥 Community'
    };
    return types[type] || type;
  };

  const getContentTagBadge = (tag) => {
    const tags = {
      'ai-generated': { icon: '🤖', label: 'AI Generated', class: 'tag-ai' },
      'user-written': { icon: '✍️', label: 'User Written', class: 'tag-user' },
      'detected-ai': { icon: '🔍', label: 'Detected AI', class: 'tag-detected' },
      'pending': { icon: '⏳', label: 'Analyzing...', class: 'tag-pending' }
    };
    return tags[tag] || tags['ai-generated'];
  };

  return (
    <div className="page-list">
      {pages.map(page => {
        const tagInfo = getContentTagBadge(page.contentTag);
        return (
          <Link 
            key={page.id} 
            to={`/city/${cityId}/page/${page.id}`}
            className="page-card"
          >
            <div className="page-badges">
              <div className="page-type-badge">{getPageTypeLabel(page.type)}</div>
              <div className={`content-tag-badge ${tagInfo.class}`} title={tagInfo.label}>
                {tagInfo.icon} {tagInfo.label}
              </div>
            </div>
            <h4>{page.title}</h4>
            <p className="page-excerpt">
              {page.content.substring(0, 150)}...
            </p>
            <div className="page-meta">
              <span>📅 {new Date(page.createdAt).toLocaleDateString()}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default PageList;
```

## CSS Styling

```css
/* Content Mode Selector */
.content-mode-selector {
  margin-bottom: var(--space-8);
  padding: var(--space-6);
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
}

.content-mode-selector h3 {
  text-align: center;
  margin-bottom: var(--space-6);
  color: var(--text-primary);
}

.mode-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-4);
}

.mode-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-6);
  background: rgba(255, 255, 255, 0.8);
  border: 3px solid rgba(112, 92, 83, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all var(--transition-base);
  text-align: center;
}

.mode-option:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  border-color: var(--public-square-accent);
}

.mode-option.active {
  background: linear-gradient(135deg, rgba(230, 126, 34, 0.2), rgba(52, 152, 219, 0.2));
  border-color: var(--public-square-accent);
  border-width: 4px;
}

.mode-icon {
  font-size: 3rem;
  margin-bottom: var(--space-3);
}

.mode-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.mode-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* Content Tag Badges */
.page-badges {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-3);
}

.content-tag-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.tag-ai {
  background: #3498DB;
  color: white;
}

.tag-user {
  background: #27AE60;
  color: white;
}

.tag-detected {
  background: #E67E22;
  color: white;
}

.tag-pending {
  background: #95A5A6;
  color: white;
}

/* Field hints */
.field-hint {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: var(--space-2);
  font-style: italic;
}
```

## Testing Checklist

- [ ] Create page with AI Generate mode
- [ ] Create page with Write Myself mode
- [ ] Switch between modes without losing title
- [ ] Validate prompt length (10-500)
- [ ] Validate content length (50-5000)
- [ ] Test AI detection with AI-generated text
- [ ] Test AI detection with human-written text
- [ ] Verify tags display correctly
- [ ] Test migration script on existing pages
- [ ] Test async detection doesn't block page creation
- [ ] Verify error handling for failed detection
- [ ] Test mobile responsiveness

## Performance Considerations

- AI detection runs asynchronously
- Page is saved immediately with "pending" tag
- Tag updates via background process
- No blocking on page creation
- Cache detection results to avoid re-analysis
