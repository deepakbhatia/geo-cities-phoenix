import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', theme: '', vibe: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = () => {
    fetch('/api/cities')
      .then(res => res.json())
      .then(data => {
        setCities(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  };

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
        throw new Error('Failed to create city');
      }

      const newCity = await res.json();
      setCities([...cities, newCity]);
      setFormData({ name: '', theme: '', vibe: '' });
      setShowForm(false);
      // Navigate to the new city
      navigate(`/city/${newCity.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="loading">Loading cities...</div>;

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

      {cities.length === 0 && !showForm ? (
        <div className="empty-state" style={{ marginTop: 'var(--space-12)' }}>
          <div className="empty-state-icon">🌐</div>
          <p className="empty-state-message">No cities yet!</p>
          <p className="empty-state-hint">Click "Create New City" to build your first neighbourhood.</p>
        </div>
      ) : (
        <div className="city-grid">
          {cities.map(city => (
            <Link key={city.id} to={`/city/${city.id}`} className="city-card">
              <div className="city-icon">🌆</div>
              <h3>{city.name}</h3>
              <div className="city-details">
                <p className="theme">🎨 {city.theme}</p>
                <p className="vibe">✨ {city.vibe}</p>
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

export default Home;
