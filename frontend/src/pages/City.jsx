import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import PageList from '../components/PageList';

// Simple markdown-to-HTML converter for AI-generated content
const formatAIContent = (text) => {
  if (!text) return '';
  
  return text
    // Bold: **text** or __text__
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Italic: *text* or _text_
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');
};

function City() {
  const { id } = useParams();
  const [city, setCity] = useState(null);
  const [publicSquare, setPublicSquare] = useState('');
  const [newsletter, setNewsletter] = useState('');
  const [radio, setRadio] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pages state
  const [pages, setPages] = useState([]);
  const [pagesLoading, setPagesLoading] = useState(true);
  
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

  // Fetch pages for this city
  useEffect(() => {
    if (city) {
      fetch(`/api/content/${id}`)
        .then(res => res.json())
        .then(data => {
          setPages(data);
          setPagesLoading(false);
        })
        .catch(err => {
          console.error('Error fetching pages:', err);
          setPagesLoading(false);
        });
    }
  }, [city, id]);

  // Generate functions
  const generatePublicSquare = async () => {
    if (!city) return;
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
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate public square update');
      }
      const data = await res.json();
      setPublicSquare(data.summary);
    } catch (err) {
      console.error('Error generating public square:', err);
      setPublicSquareError(err.message);
    } finally {
      setPublicSquareLoading(false);
    }
  };

  const generateNewsletter = async () => {
    if (!city) return;
    try {
      setNewsletterError('');
      setNewsletterLoading(true);
      const res = await fetch(`/api/ai/newsletter/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityName: city.name,
          theme: city.theme
        })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate newsletter');
      }
      const data = await res.json();
      setNewsletter(data.newsletter);
    } catch (err) {
      console.error('Error generating newsletter:', err);
      setNewsletterError(err.message);
    } finally {
      setNewsletterLoading(false);
    }
  };

  const generateRadio = async () => {
    if (!city) return;
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
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate radio station');
      }
      const data = await res.json();
      setRadio(data.radioDescription);
    } catch (err) {
      console.error('Error generating radio:', err);
      setRadioError(err.message);
    } finally {
      setRadioLoading(false);
    }
  };

  // Load cached AI content when city loads, auto-generate if missing
  useEffect(() => {
    if (!city) return;
    
    let isMounted = true;
    
    fetch(`/api/ai/cached/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        
        // Set cached content if available
        if (data.publicSquare) {
          setPublicSquare(data.publicSquare);
        } else {
          // Auto-generate if not cached
          generatePublicSquare();
        }
        
        if (data.newsletter) {
          setNewsletter(data.newsletter);
        } else {
          // Auto-generate if not cached
          generateNewsletter();
        }
        
        if (data.radio) {
          setRadio(data.radio);
        } else {
          // Auto-generate if not cached
          generateRadio();
        }
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Error fetching cached AI content:', err);
        // Don't auto-generate on error to prevent infinite loops
      });
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, id]);

  if (loading) return <div className="loading">Loading city...</div>;
  if (error) return <div className="loading">{error}</div>;

  return (
    <div className="city">
      <Link to="/" className="back-link">← Back to Cities</Link>
      
      <h2>{city.name}</h2>
      <p className="city-meta">Theme: {city.theme} | Vibe: {city.vibe}</p>

      <div className="city-features">
        <section className="public-square">
          <h3>Daily Events</h3>
          <button 
            onClick={generatePublicSquare} 
            disabled={publicSquareLoading}
            className={publicSquareError ? 'error-button' : ''}
          >
            {publicSquareLoading ? 'Generating...' : publicSquareError ? '🔄 Try Again' : publicSquare ? '🔄 Generate New' : '✨ See Today\'s Events'}
          </button>
          {publicSquareLoading && <LoadingSpinner message="Checking the event calendar..." />}
          {publicSquareError && <div className="error-message">❌ {publicSquareError}</div>}
          {!publicSquare && !publicSquareLoading && !publicSquareError && (
            <div className="empty-state">
              <div className="empty-state-icon">🏛️</div>
              <p className="empty-state-message">No events scheduled yet!</p>
              <p className="empty-state-hint">Click above to see what's happening today in {city.name}.</p>
            </div>
          )}
          {publicSquare && !publicSquareLoading && (
            <div className="ai-content public-square-content">
              <div 
                className="announcement-text" 
                dangerouslySetInnerHTML={{ __html: formatAIContent(publicSquare) }}
              />
              <div className="timestamp">📅 Today</div>
            </div>
          )}
        </section>

        <section className="radio">
          <h3>Radio Station</h3>
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
                <div 
                  className="radio-text" 
                  dangerouslySetInnerHTML={{ __html: formatAIContent(radio) }}
                />
              </div>
            </div>
          )}
        </section>

        <section className="newsletter">
          <h3>Top News</h3>
          <button 
            onClick={generateNewsletter} 
            disabled={newsletterLoading}
            className={newsletterError ? 'error-button' : ''}
          >
            {newsletterLoading ? 'Generating...' : newsletterError ? '🔄 Try Again' : newsletter ? '🔄 Get Latest News' : '✨ Read Today\'s News'}
          </button>
          {newsletterLoading && <LoadingSpinner message="Gathering today's top stories..." />}
          {newsletterError && <div className="error-message">❌ {newsletterError}</div>}
          {!newsletter && !newsletterLoading && !newsletterError && (
            <div className="empty-state">
              <div className="empty-state-icon">📰</div>
              <p className="empty-state-message">No news yet!</p>
              <p className="empty-state-hint">Read today's top stories from {city.name}.</p>
            </div>
          )}
          {newsletter && !newsletterLoading && (
            <div className="ai-content newsletter-content">
              <div className="newsletter-header">
                <div className="masthead">📰 {city.name.toUpperCase()} DAILY NEWS</div>
                <div className="issue-info">Today • {new Date().toLocaleDateString()}</div>
              </div>
              <div 
                className="newsletter-body" 
                dangerouslySetInnerHTML={{ __html: `<p>${formatAIContent(newsletter)}</p>` }}
              />
            </div>
          )}
        </section>
      </div>

      <section className="city-pages">
        <div className="section-header">
          <h3>📄 Pages ({pages.length})</h3>
          <Link to={`/city/${id}/create-page`} className="create-page-btn">
            ✨ Create Page
          </Link>
        </div>
        {pagesLoading ? (
          <div className="loading">Loading pages...</div>
        ) : (
          <PageList cityId={id} pages={pages} />
        )}
      </section>
    </div>
  );
}

export default City;
