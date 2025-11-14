import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function City() {
  const { id } = useParams();
  const [city, setCity] = useState(null);
  const [publicSquare, setPublicSquare] = useState('');
  const [newsletter, setNewsletter] = useState('');
  const [radio, setRadio] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [publicSquareError, setPublicSquareError] = useState('');
  const [newsletterError, setNewsletterError] = useState('');
  const [radioError, setRadioError] = useState('');

  useEffect(() => {
    fetch(`/api/cities/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('City not found');
        }
        return res.json();
      })
      .then(data => {
        setCity(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const generatePublicSquare = async () => {
    try {
      setPublicSquareError('');
      const res = await fetch(`/api/ai/public-square/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityName: city.name,
          theme: city.theme,
          recentActivity: 'Various AI-generated pages posted'
        })
      });
      if (!res.ok) {
        throw new Error('Failed to generate public square update');
      }
      const data = await res.json();
      setPublicSquare(data.summary);
    } catch (err) {
      setPublicSquareError(err.message);
    }
  };

  const generateNewsletter = async () => {
    try {
      setNewsletterError('');
      const res = await fetch(`/api/ai/newsletter/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityName: city.name,
          theme: city.theme,
          pages: city.pages
        })
      });
      if (!res.ok) {
        throw new Error('Failed to generate newsletter');
      }
      const data = await res.json();
      setNewsletter(data.newsletter);
    } catch (err) {
      setNewsletterError(err.message);
    }
  };

  const generateRadio = async () => {
    try {
      setRadioError('');
      const res = await fetch(`/api/ai/radio/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityName: city.name,
          vibe: city.vibe
        })
      });
      if (!res.ok) {
        throw new Error('Failed to generate radio station');
      }
      const data = await res.json();
      setRadio(data.radioDescription);
    } catch (err) {
      setRadioError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading city...</div>;
  if (error) return <div className="loading">{error}</div>;

  return (
    <div className="city">
      <Link to="/" className="back-link">← Back to Cities</Link>
      
      <h2>{city.name}</h2>
      <p className="city-meta">Theme: {city.theme} | Vibe: {city.vibe}</p>

      <div className="city-features">
        <section className="public-square">
          <h3>📢 Public Square</h3>
          <button onClick={generatePublicSquare}>Generate Update</button>
          {publicSquareError && <div className="error-message">{publicSquareError}</div>}
          {publicSquare && <div className="ai-content">{publicSquare}</div>}
        </section>

        <section className="radio">
          <h3>📻 Radio Station</h3>
          <button onClick={generateRadio}>Tune In</button>
          {radioError && <div className="error-message">{radioError}</div>}
          {radio && <div className="ai-content">{radio}</div>}
        </section>

        <section className="newsletter">
          <h3>📰 Newsletter</h3>
          <button onClick={generateNewsletter}>Generate Issue</button>
          {newsletterError && <div className="error-message">{newsletterError}</div>}
          {newsletter && <div className="ai-content">{newsletter}</div>}
        </section>
      </div>
    </div>
  );
}

export default City;
