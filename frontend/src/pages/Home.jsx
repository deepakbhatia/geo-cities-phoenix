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
      <div className="city-grid">
        {cities.map(city => (
          <Link key={city.id} to={`/city/${city.id}`} className="city-card">
            <h3>{city.name}</h3>
            <p className="theme">{city.theme}</p>
            <p className="vibe">Vibe: {city.vibe}</p>
            <p className="pages">{city.pages.length} pages</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;
