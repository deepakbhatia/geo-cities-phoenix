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
              disabled={creating}
            >
              <span className="mode-icon">🤖</span>
              <span className="mode-title">AI Generate</span>
              <span className="mode-desc">Describe what you want, AI creates it</span>
            </button>
            <button
              type="button"
              className={`mode-option ${contentMode === 'write-myself' ? 'active' : ''}`}
              onClick={() => handleModeChange('write-myself')}
              disabled={creating}
            >
              <span className="mode-icon">✍️</span>
              <span className="mode-title">Write Myself</span>
              <span className="mode-desc">Write your own content manually</span>
            </button>
          </div>
        </div>
        
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
              disabled={creating}
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
                placeholder="Example: 'A personal homepage about my love for retro gaming, featuring my favorite 90s games and memories from playing them as a kid.'"
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
