import { useEffect, useState } from "react";
import { searchPublicItems } from "../../api/publicRepository.api";
import "./public-search.css";
export default function PublicSearch() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [year, setYear] = useState("all");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await searchPublicItems({
        query,
        type,
        year,
      });
      setItems(res.data || []);
    } catch (err) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="public-search-page">
      {/* SEARCH BAR */}
      <div className="search-box">
        <input
          placeholder="Search articles, theses, datasets..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">All types</option>
          <option value="article">Article</option>
          <option value="thesis">Thesis</option>
          <option value="dataset">Dataset</option>
        </select>

        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="all">Any year</option>
          {Array.from({ length: 10 }).map((_, i) => {
            const y = new Date().getFullYear() - i;
            return (
              <option key={y} value={y}>
                {y}
              </option>
            );
          })}
        </select>

        <button onClick={fetchData}>Search</button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="loading">Searching repository…</div>
      ) : items.length === 0 ? (
        <div className="no-data">
          <h3>No results found</h3>
          <p>
            Try different keywords or filters to discover research content.
          </p>
        </div>
      ) : (
        <div className="results-grid">
          {items.map((item) => (
            <div key={item.uuid} className="repo-card">
              <h3>{item.title}</h3>
              <p className="author">{item.author}</p>
              <p className="abstract">
                {item.abstract?.slice(0, 150)}…
              </p>

              <div className="meta">
                <span>{item.type}</span>
                <span>{item.year}</span>
              </div>

              <a
                href={`/repository/public/view/${item.uuid}`}
                className="view-btn"
              >
                View Details
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
