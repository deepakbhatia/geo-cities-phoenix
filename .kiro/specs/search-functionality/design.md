# Search Functionality - Design Document

## Overview

This document outlines the technical design for implementing a cost-efficient search system in GeoCities AI. The design prioritizes client-side filtering for cities to minimize Firestore costs while providing fast, responsive search.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      React Frontend                          │
│                                                              │
│  ┌────────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │  SearchBar     │  │  FilterBar   │  │  SearchResults │ │
│  │  Component     │  │  Component   │  │  Component     │ │
│  └────────┬───────┘  └──────┬───────┘  └────────┬───────┘ │
│           │                  │                    │          │
│           └──────────────────┼────────────────────┘          │
│                              │                               │
│                    ┌─────────▼─────────┐                    │
│                    │  Search Context   │                    │
│                    │  (State Manager)  │                    │
│                    └─────────┬─────────┘                    │
│                              │                               │
│           ┌──────────────────┼──────────────────┐           │
│           │                  │                  │           │
│    ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐   │
│    │   Cities    │   │   Filters   │   │   Cache     │   │
│    │   Cache     │   │   State     │   │   Manager   │   │
│    └─────────────┘   └─────────────┘   └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Only for content search
                              ▼
                    ┌─────────────────┐
                    │  Express API    │
                    │  /api/search    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Firestore     │
                    │   (content)     │
                    └─────────────────┘
```

## Component Design

### 1. SearchBar Component

**Location:** `frontend/src/components/SearchBar.jsx`

```jsx
import { useState, useEffect } from 'react';
import { useSearch } from '../contexts/SearchContext';

function SearchBar() {
  const { searchQuery, setSearchQuery, isSearching } = useSearch();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, setSearchQuery]);

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
  };

  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search cities by name, theme, or vibe..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          className="search-input"
          aria-label="Search cities"
        />
        {localQuery && (
          <button 
            onClick={handleClear}
            className="clear-button"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
      {isSearching && <div className="search-loading">Searching...</div>}
    </div>
  );
}

export default SearchBar;
```

### 2. FilterBar Component

**Location:** `frontend/src/components/FilterBar.jsx`

```jsx
import { useSearch } from '../contexts/SearchContext';

function FilterBar() {
  const { 
    filters, 
    setFilters, 
    availableThemes, 
    resultCount,
    clearFilters 
  } = useSearch();

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' }
  ];

  const activeFilterCount = 
    (filters.theme ? 1 : 0) + 
    (filters.sort !== 'newest' ? 1 : 0);

  return (
    <div className="filter-bar">
      <div className="filter-controls">
        <select
          value={filters.theme || ''}
          onChange={(e) => setFilters({ ...filters, theme: e.target.value || null })}
          className="theme-filter"
          aria-label="Filter by theme"
        >
          <option value="">All Themes</option>
          {availableThemes.map(theme => (
            <option key={theme} value={theme}>
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          className="sort-filter"
          aria-label="Sort results"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters ({activeFilterCount})
          </button>
        )}
      </div>

      <div className="result-count" aria-live="polite">
        {resultCount} {resultCount === 1 ? 'city' : 'cities'} found
      </div>
    </div>
  );
}

export default FilterBar;
```

### 3. SearchContext (State Management)

**Location:** `frontend/src/contexts/SearchContext.jsx`

```jsx
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const SearchContext = createContext();

export function SearchProvider({ children, cities }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    theme: searchParams.get('theme') || null,
    sort: searchParams.get('sort') || 'newest'
  });
  const [isSearching, setIsSearching] = useState(false);

  // Update URL when search/filters change
  useEffect(() => {
    const params = {};
    if (searchQuery) params.q = searchQuery;
    if (filters.theme) params.theme = filters.theme;
    if (filters.sort !== 'newest') params.sort = filters.sort;
    
    setSearchParams(params, { replace: true });
  }, [searchQuery, filters, setSearchParams]);

  // Client-side filtering
  const filteredCities = useMemo(() => {
    setIsSearching(true);
    
    let results = [...cities];

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(city => 
        city.name.toLowerCase().includes(query) ||
        city.theme.toLowerCase().includes(query) ||
        city.vibe.toLowerCase().includes(query)
      );
    }

    // Theme filter
    if (filters.theme) {
      results = results.filter(city => 
        city.theme.toLowerCase() === filters.theme.toLowerCase()
      );
    }

    // Sort
    switch (filters.sort) {
      case 'oldest':
        results.sort((a, b) => a.id.localeCompare(b.id));
        break;
      case 'name-asc':
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        results.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
      default:
        results.sort((a, b) => b.id.localeCompare(a.id));
    }

    setTimeout(() => setIsSearching(false), 0);
    return results;
  }, [cities, searchQuery, filters]);

  // Get unique themes for filter dropdown
  const availableThemes = useMemo(() => {
    const themes = new Set(cities.map(city => city.theme));
    return Array.from(themes).sort();
  }, [cities]);

  const clearFilters = () => {
    setFilters({ theme: null, sort: 'newest' });
    setSearchQuery('');
  };

  const value = {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    filteredCities,
    availableThemes,
    resultCount: filteredCities.length,
    isSearching,
    clearFilters
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
}
```

### 4. Updated Home Page with Search

**Location:** `frontend/src/pages/Home.jsx`

```jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchProvider, useSearch } from '../contexts/SearchContext';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';

function HomeContent() {
  const navigate = useNavigate();
  const { filteredCities, searchQuery } = useSearch();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', theme: '', vibe: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

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
        const data = await res.json();
        throw new Error(data.error || 'Failed to create city');
      }

      const newCity = await res.json();
      setFormData({ name: '', theme: '', vibe: '' });
      setShowForm(false);
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
          {/* Form content same as before */}
        </div>
      )}

      <div className="search-section">
        <SearchBar />
        <FilterBar />
      </div>

      {filteredCities.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 'var(--space-12)' }}>
          <div className="empty-state-icon">🔍</div>
          <p className="empty-state-message">
            {searchQuery 
              ? `No cities found matching "${searchQuery}"`
              : 'No cities yet!'}
          </p>
          <p className="empty-state-hint">
            {searchQuery 
              ? 'Try a different search term or clear filters'
              : 'Click "Create New City" to build your first neighbourhood.'}
          </p>
        </div>
      ) : (
        <div className="city-grid">
          {filteredCities.map(city => (
            <Link key={city.id} to={`/city/${city.id}`} className="city-card">
              <div className="city-icon">🌆</div>
              <h3>{highlightMatch(city.name, searchQuery)}</h3>
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

// Helper to highlight matching text
function highlightMatch(text, query) {
  if (!query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    regex.test(part) ? <mark key={i}>{part}</mark> : part
  );
}

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
    <SearchProvider cities={cities}>
      <HomeContent />
    </SearchProvider>
  );
}

export default Home;
```

## Styling

### Search Component Styles

**Location:** `frontend/src/App.css` (append)

```css
/* Search Section */
.search-section {
  margin: var(--space-8) 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Search Bar */
.search-bar {
  position: relative;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--card-bg);
  border: 2px solid var(--text-secondary);
  border-radius: 12px;
  padding: var(--space-3) var(--space-4);
  transition: all var(--transition-base);
}

.search-input-wrapper:focus-within {
  border-color: var(--public-square-accent);
  box-shadow: 0 0 0 3px rgba(230, 126, 34, 0.2);
}

.search-icon {
  font-size: 1.2rem;
  margin-right: var(--space-3);
  color: var(--text-secondary);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  font-family: var(--font-primary);
  color: var(--text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

.clear-button {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 1.2rem;
  cursor: pointer;
  padding: var(--space-2);
  margin: 0;
  width: auto;
  transition: color var(--transition-base);
}

.clear-button:hover {
  color: var(--text-primary);
  transform: none;
  box-shadow: none;
}

.search-loading {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: var(--space-2);
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-style: italic;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.filter-controls {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.theme-filter,
.sort-filter {
  padding: var(--space-2) var(--space-4);
  border: 2px solid var(--text-secondary);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-family: var(--font-primary);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all var(--transition-base);
}

.theme-filter:hover,
.sort-filter:hover {
  border-color: var(--text-primary);
}

.theme-filter:focus,
.sort-filter:focus {
  outline: none;
  border-color: var(--public-square-accent);
  box-shadow: 0 0 0 3px rgba(230, 126, 34, 0.2);
}

.clear-filters-btn {
  background: rgba(231, 76, 60, 0.1);
  border: 2px solid var(--error);
  color: var(--error);
  padding: var(--space-2) var(--space-4);
  font-size: 0.9rem;
  width: auto;
  margin: 0;
}

.clear-filters-btn:hover:not(:disabled) {
  background: rgba(231, 76, 60, 0.2);
}

.result-count {
  font-size: 0.95rem;
  color: var(--text-secondary);
  font-weight: 600;
}

/* Highlight matching text */
mark {
  background: rgba(230, 126, 34, 0.3);
  color: var(--text-primary);
  padding: 0 2px;
  border-radius: 2px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-controls {
    width: 100%;
  }

  .theme-filter,
  .sort-filter {
    flex: 1;
  }

  .result-count {
    text-align: center;
  }
}
```

## Performance Optimization

### 1. Memoization Strategy

```javascript
// Memoize filtered results to avoid recalculation
const filteredCities = useMemo(() => {
  // Filtering logic
}, [cities, searchQuery, filters]);

// Memoize available themes
const availableThemes = useMemo(() => {
  return Array.from(new Set(cities.map(c => c.theme)));
}, [cities]);
```

### 2. Debouncing Implementation

```javascript
// Debounce search input to reduce re-renders
useEffect(() => {
  const timer = setTimeout(() => {
    setSearchQuery(localQuery);
  }, 300); // 300ms delay

  return () => clearTimeout(timer);
}, [localQuery]);
```

### 3. Virtual Scrolling (Future Enhancement)

For large result sets (1000+ cities), implement virtual scrolling:

```javascript
import { FixedSizeGrid } from 'react-window';

// Only render visible items
<FixedSizeGrid
  columnCount={3}
  columnWidth={300}
  height={600}
  rowCount={Math.ceil(filteredCities.length / 3)}
  rowHeight={250}
  width={1000}
>
  {CityCard}
</FixedSizeGrid>
```

## Cost Analysis

### Firestore Read Operations

**City Search (Client-Side):**
- Initial load: 1 query (100 cities) = 100 reads
- Subsequent searches: 0 reads (client-side filtering)
- Cost per 1000 searches: ~$0.00036 (only initial load)

**Content Search (Server-Side - Future):**
- Per search: 1 query (max 50 docs) = 50 reads
- With 5-minute cache: Reduces to ~10 reads per hour
- Cost per 1000 searches: ~$0.018

**Total Monthly Cost (10,000 users, 5 searches each):**
- City searches: $0.18
- Content searches: $9.00
- **Total: ~$9.18/month**

## Testing Strategy

### Unit Tests
- Test search filtering logic
- Test debouncing behavior
- Test filter combinations
- Test URL parameter sync

### Integration Tests
- Test search with real data
- Test filter interactions
- Test mobile responsiveness
- Test keyboard navigation

### Performance Tests
- Measure search response time
- Test with 1000+ cities
- Monitor memory usage
- Test concurrent searches

## Future Enhancements

1. **Fuzzy Search**: Use Fuse.js for approximate matching
2. **Search Analytics**: Track popular searches
3. **Autocomplete**: Suggest cities as user types
4. **Voice Search**: Speech-to-text input
5. **Advanced Filters**: Date range, page count, etc.
6. **Saved Searches**: Bookmark favorite searches
7. **Search History**: Show recent searches
