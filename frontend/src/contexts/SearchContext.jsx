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

  // Client-side filtering with memoization
  const filteredCities = useMemo(() => {
    setIsSearching(true);
    
    let results = [...cities];

    // Text search across name, theme, and vibe
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
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

    // Sort results
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

    // Clear searching state after filtering
    setTimeout(() => setIsSearching(false), 0);
    return results;
  }, [cities, searchQuery, filters]);

  // Get unique themes for filter dropdown
  const availableThemes = useMemo(() => {
    const themes = new Set(cities.map(city => city.theme));
    return Array.from(themes).sort();
  }, [cities]);

  // Clear all filters and search
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
