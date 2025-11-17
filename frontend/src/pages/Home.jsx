import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
      .catch(err => console.error(err));
  }, []);

  if (loading) return <div className="loading">Loading cities...</div>;

  return (
    <div className="home">
      <h2>Explore AI Cities</h2>
      {cities.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 'var(--space-12)' }}>
          <div className="empty-state-icon">🌐</div>
          <p className="empty-state-message">No cities yet!</p>
          <p className="empty-state-hint">Cities will appear here as they're created.</p>
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
