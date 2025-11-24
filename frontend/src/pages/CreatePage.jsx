import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
      setCreating(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="create-page-container">
      <Link to={`/city/${cityId}`} className="back-link">
        ← Back to City
      </Link>

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

          <div className="form-group">
            <label htmlFor="prompt">What should this page be about?</label>
            <textarea
              id="prompt"
              name="prompt"
              value={formData.prompt}
              onChange={handleChange}
              placeholder="Describe what you want on this page. The AI will generate creative content based on your description and the city's theme. Be specific and creative!"
              required
              minLength={10}
              maxLength={500}
              rows={6}
              disabled={creating}
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
    </div>
  );
}

export default CreatePage;
