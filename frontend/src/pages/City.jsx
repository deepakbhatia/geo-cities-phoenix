import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

function City() {
  const { id } = useParams();
  const [city, setCity] = useState(null);
  const [publicSquare, setPublicSquare] = useState('');
  const [newsletter, setNewsletter] = useState('');
  const [radio, setRadio] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Loading states for each feature
  const [publicSquareLoading, setPublicSquareLoading] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [radioLoading, setRadioLoading] = useState(false);
  
  // Error states for each feature
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
      setPublicSquareLoading(true);
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
    } finally {
      setPublicSquareLoading(false);
    }
  };

  const generateNewsletter = async () => {
    try {
      setNewsletterError('');
      setNewsletterLoading(true);
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
    } finally {
      setNewsletterLoading(false);
    }
  };

  const generateRadio = async () => {
    try {
      setRadioError('');
      setRadioLoading(true);
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
    } finally {
      setRadioLoading(false);
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
          <button 
            onClick={generatePublicSquare} 
            disabled={publicSquareLoading}
            className={publicSquareError ? 'error-button' : ''}
          >
            {publicSquareLoading ? 'Generating...' : publicSquareError ? '🔄 Try Again' : publicSquare ? '🔄 Generate New' : '✨ Generate Update'}
          </button>
          {publicSquareLoading && <LoadingSpinner message="Consulting the AI town crier..." />}
          {publicSquareError && <div className="error-message">❌ {publicSquareError}</div>}
          {!publicSquare && !publicSquareLoading && !publicSquareError && (
            <div className="empty-state">
              <div className="empty-state-icon">🏛️</div>
              <p className="empty-state-message">The town crier is waiting!</p>
              <p className="empty-state-hint">Click above to hear what's happening in {city.name}.</p>
            </div>
          )}
          {publicSquare && !publicSquareLoading && (
            <div className="ai-content public-square-content">
              <div className="announcement-text">{publicSquare}</div>
              <div className="timestamp">📅 Just now</div>
            </div>
          )}
        </section>

        <section className="radio">
          <h3>📻 Radio Station</h3>
          <button 
            onClick={generateRadio} 
            disabled={radioLoading}
            className={radioError ? 'error-button' : ''}
          >
            {radioLoading ? 'Generating...' : radioError ? '🔄 Try Again' : radio ? '🔄 Tune In Again' : '✨ Tune In'}
          </button>
          {radioLoading && <LoadingSpinner message="Tuning the airwaves..." />}
          {radioError && <div className="error-message">❌ {radioError}</div>}
          {!radio && !radioLoading && !radioError && (
            <div className="empty-state">
              <div className="empty-state-icon">📻</div>
              <p className="empty-state-message">The airwaves are silent...</p>
              <p className="empty-state-hint">Tune in to discover {city.name}'s unique sound.</p>
            </div>
          )}
          {radio && !radioLoading && (
            <div className="ai-content radio-content">
              <div className="radio-display">
                <div className="now-playing">🎵 NOW PLAYING</div>
                <div className="radio-text">{radio}</div>
              </div>
            </div>
          )}
        </section>

        <section className="newsletter">
          <h3>📰 Newsletter</h3>
          <button 
            onClick={generateNewsletter} 
            disabled={newsletterLoading}
            className={newsletterError ? 'error-button' : ''}
          >
            {newsletterLoading ? 'Generating...' : newsletterError ? '🔄 Try Again' : newsletter ? '🔄 Generate New Issue' : '✨ Generate Issue'}
          </button>
          {newsletterLoading && <LoadingSpinner message="Printing the newsletter..." />}
          {newsletterError && <div className="error-message">❌ {newsletterError}</div>}
          {!newsletter && !newsletterLoading && !newsletterError && (
            <div className="empty-state">
              <div className="empty-state-icon">📰</div>
              <p className="empty-state-message">No news yet!</p>
              <p className="empty-state-hint">Generate the first issue to see what's trending in {city.name}.</p>
            </div>
          )}
          {newsletter && !newsletterLoading && (
            <div className="ai-content newsletter-content">
              <div className="newsletter-header">
                <div className="masthead">📰 THE {city.name.toUpperCase()} CHRONICLE</div>
                <div className="issue-info">Issue #1 • {new Date().toLocaleDateString()}</div>
              </div>
              <div className="newsletter-body">{newsletter}</div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default City;
