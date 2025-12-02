import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchProvider, useSearch } from '../contexts/SearchContext';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';

// Helper function to highlight matching text
function highlightMatch(text, query) {
  if (!query) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    regex.test(part) ? <mark key={i}>{part}</mark> : part
  );
}

function HomeContent() {
  const navigate = useNavigate();
  const { filteredCities, searchQuery } = useSearch();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', theme: '', vibe: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);

    try {
      const res = await fetch('/api/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create city');
      }

      const newCity = await res.json();
      setFormData({ name: '', theme: '', vibe: '' });
      setShowForm(false);
      navigate(`/city/${newCity.id}`);
      // Reload page to refresh city list
      window.location.reload();
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
    <div className="home">
      <div className="home-header">
        <h2>Explore AI Cities</h2>
        <button className="create-city-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '✨ Create New City'}
        </button>
      </div>

      {showForm && (
        <div className="create-city-form">
          <h3>🏙️ Create Your Neighbourhood</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">City Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Silicon Valley, Sunset Boulevard"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="theme">Theme</label>
              <input
                type="text"
                id="theme"
                name="theme"
                value={formData.theme}
                onChange={handleChange}
                placeholder="e.g., tech, art, cyberpunk, nature"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="vibe">Vibe</label>
              <input
                type="text"
                id="vibe"
                name="vibe"
                value={formData.vibe}
                onChange={handleChange}
                placeholder="e.g., futuristic, creative, edgy, peaceful"
                required
              />
            </div>

            {error && <div className="error-message">❌ {error}</div>}

            <button type="submit" disabled={creating} className="submit-btn">
              {creating ? 'Creating...' : '🚀 Create City'}
            </button>
          </form>
        </div>
      )}

      <div className="search-section">
        <SearchBar />
        <FilterBar />
      </div>

      {filteredCities.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 'var(--space-12)' }}>
          <div className="empty-state-icon">🔍</div>
          <p className="empty-state-message">
            {searchQuery 
              ? `No cities found matching "${searchQuery}"`
              : 'No cities yet!'}
          </p>
          <p className="empty-state-hint">
            {searchQuery 
              ? 'Try a different search term or clear filters'
              : 'Click "Create New City" to build your first neighbourhood.'}
          </p>
        </div>
      ) : (
        <div className="city-grid">
          {filteredCities.map(city => (
            <Link key={city.id} to={`/city/${city.id}`} className="city-card">
              <div className="city-icon">🌆</div>
              <h3>{highlightMatch(city.name, searchQuery)}</h3>
              <div className="city-details">
                <p className="theme">🎨 {highlightMatch(city.theme, searchQuery)}</p>
                <p className="vibe">✨ {highlightMatch(city.vibe, searchQuery)}</p>
              </div>
              <div className="city-stats">
                <span className="stat">📄 {city.pages.length} pages</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Home() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cities')
      .then(res => res.json())
      .then(data => {
        setCities(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching cities:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Loading cities...</div>;

  return (
    <SearchProvider cities={cities}>
      <HomeContent />
    </SearchProvider>
  );
}

export default Home;
