export default function SearchBar({ query, setQuery, filters, setFilters }) {
  return (
    <form className="search-bar">
      <div className="search-input">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search articles, theses, authors..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <select
        value={filters.type}
        onChange={(e) =>
          setFilters({ ...filters, type: e.target.value })
        }
      >
        <option value="all">All Types</option>
        <option value="article">Article</option>
        <option value="thesis">Thesis</option>
        <option value="dataset">Dataset</option>
      </select>

      <select
        value={filters.sort}
        onChange={(e) =>
          setFilters({ ...filters, sort: e.target.value })
        }
      >
        <option value="recent">Most Recent</option>
        <option value="popular">Most Viewed</option>
      </select>

      <button type="button" className="search-btn">
        Search
      </button>
    </form>
  );
}
