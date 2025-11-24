import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

function PageDetail() {
  const { cityId, pageId } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/content/${cityId}/${pageId}`)
      .then(res => {
        if (!res.ok) throw new Error('Page not found');
        return res.json();
      })
      .then(data => {
        setPage(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [cityId, pageId]);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${page.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/content/${cityId}/${pageId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete page');

      navigate(`/city/${cityId}`);
    } catch (err) {
      alert(err.message);
    }
  };

  const getPageTypeLabel = (type) => {
    const types = {
      'personal': '🏠 Personal Homepage',
      'fan-site': '⭐ Fan Site',
      'business': '💼 Business Page',
      'blog': '📝 Blog/Journal',
      'art-gallery': '🎨 Art Gallery',
      'music': '🎵 Music Page',
      'gaming': '🎮 Gaming Page',
      'community': '👥 Community Hub'
    };
    return types[type] || type;
  };

  if (loading) return <div className="loading">Loading page...</div>;
  if (error) return <div className="loading">{error}</div>;

  return (
    <div className="page-detail-container">
      <Link to={`/city/${cityId}`} className="back-link">
        ← Back to City
      </Link>

      <div className="page-detail">
        <div className="page-header">
          <div className="page-type-badge">{getPageTypeLabel(page.type)}</div>
          <h1>{page.title}</h1>
          <div className="page-meta">
            <span>📅 Created {new Date(page.createdAt).toLocaleDateString()}</span>
            {page.updatedAt !== page.createdAt && (
              <span> • Updated {new Date(page.updatedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        <div className="page-content">
          {page.content}
        </div>

        <div className="page-actions">
          <button onClick={handleDelete} className="delete-btn">
            🗑️ Delete Page
          </button>
        </div>
      </div>
    </div>
  );
}

export default PageDetail;
