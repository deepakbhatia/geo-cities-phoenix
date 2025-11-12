import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function City() {
  const { id } = useParams();
  const [city, setCity] = useState(null);
  const [publicSquare, setPublicSquare] = useState('');
  const [newsletter, setNewsletter] = useState('');
  const [radio, setRadio] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/cities/${id}`)
      .then(res => res.json())
      .then(data => {
        setCity(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, [id]);

  const generatePublicSquare = async () => {
    const res = await fetch(`/api/ai/public-square/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cityName: city.name,
        theme: city.theme,
        recentActivity: 'Various AI-generated pages posted'
      })
    });
    const data = await res.json();
    setPublicSquare(data.summary);
  };

  const generateNewsletter = async () => {
    const res = await fetch(`/api/ai/newsletter/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cityName: city.name,
        theme: city.theme,
        pages: city.pages
      })
    });
    const data = await res.json();
    setNewsletter(data.newsletter);
  };

  const generateRadio = async () => {
    const res = await fetch(`/api/ai/radio/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cityName: city.name,
        vibe: city.vibe
      })
    });
    const data = await res.json();
    setRadio(data.radioDescription);
  };

  if (loading) return <div className="loading">Loading city...</div>;
  if (!city) return <div>City not found</div>;

  return (
    <div className="city">
      <Link to="/" className="back-link">← Back to Cities</Link>
      
      <h2>{city.name}</h2>
      <p className="city-meta">Theme: {city.theme} | Vibe: {city.vibe}</p>

      <div className="city-features">
        <section className="public-square">
          <h3>📢 Public Square</h3>
          <button onClick={generatePublicSquare}>Generate Update</button>
          {publicSquare && <div className="ai-content">{publicSquare}</div>}
        </section>

        <section className="radio">
          <h3>📻 Radio Station</h3>
          <button onClick={generateRadio}>Tune In</button>
          {radio && <div className="ai-content">{radio}</div>}
        </section>

        <section className="newsletter">
          <h3>📰 Newsletter</h3>
          <button onClick={generateNewsletter}>Generate Issue</button>
          {newsletter && <div className="ai-content">{newsletter}</div>}
        </section>
      </div>
    </div>
  );
}

export default City;
