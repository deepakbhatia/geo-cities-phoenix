import { Link } from 'react-router-dom';

function PageList({ cityId, pages }) {
  if (pages.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📄</div>
        <p className="empty-state-message">No pages yet!</p>
        <p className="empty-state-hint">Be the first to create a page in this city.</p>
      </div>
    );
  }

  const getPageTypeLabel = (type) => {
    const types = {
      'personal': '🏠 Personal',
      'fan-site': '⭐ Fan Site',
      'business': '💼 Business',
      'blog': '📝 Blog',
      'art-gallery': '🎨 Art',
      'music': '🎵 Music',
      'gaming': '🎮 Gaming',
      'community': '👥 Community'
    };
    return types[type] || type;
  };

  return (
    <div className="page-list">
      {pages.map(page => (
        <Link 
          key={page.id} 
          to={`/city/${cityId}/page/${page.id}`}
          className="page-card"
        >
          <div className="page-type-badge">{getPageTypeLabel(page.type)}</div>
          <h4>{page.title}</h4>
          <p className="page-excerpt">
            {page.content.substring(0, 150)}...
          </p>
          <div className="page-meta">
            <span>📅 {new Date(page.createdAt).toLocaleDateString()}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default PageList;
