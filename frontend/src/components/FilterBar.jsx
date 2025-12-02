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
          <button 
            onClick={clearFilters} 
            className="clear-filters-btn"
            aria-label={`Clear ${activeFilterCount} active filters`}
          >
            Clear Filters ({activeFilterCount})
          </button>
        )}
      </div>

      <div className="result-count" aria-live="polite" aria-atomic="true">
        {resultCount} {resultCount === 1 ? 'city' : 'cities'} found
      </div>
    </div>
  );
}

export default FilterBar;
