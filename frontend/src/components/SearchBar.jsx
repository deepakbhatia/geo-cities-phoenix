import { useState, useEffect } from 'react';
import { useSearch } from '../contexts/SearchContext';

function SearchBar() {
  const { searchQuery, setSearchQuery, isSearching } = useSearch();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, setSearchQuery]);

  // Sync with external changes to searchQuery
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className="search-bar" role="search">
      <div className="search-input-wrapper">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <input
          type="text"
          placeholder="Search cities by name, theme, or vibe..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="search-input"
          aria-label="Search cities"
          autoComplete="off"
        />
        {localQuery && (
          <button 
            onClick={handleClear}
            className="clear-button"
            aria-label="Clear search"
            type="button"
          >
            ✕
          </button>
        )}
      </div>
      {isSearching && (
        <div className="search-loading" aria-live="polite">
          Searching...
        </div>
      )}
    </div>
  );
}

export default SearchBar;
