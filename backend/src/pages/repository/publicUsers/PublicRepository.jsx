import { useEffect, useState } from "react";
import { searchPublicItems } from "../../../api/publicRepository.api";
import ItemCard from "../publicUsers/ItemCard";
import ItemModal from "../publicUsers/ItemModal";
import SearchBar from "../publicUsers/SearchBar";
import "../publicUsers/repository.css";
import LayoutWrapper from "../../../components/layout/LayoutWrapper";
import {
  FiGrid,
  FiList,
  FiFilter,
  FiDownload,
  FiEye,
  FiCalendar,
  FiType,
} from "react-icons/fi";

export default function PublicRepository() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    type: "all",
    year: "all",
    sort: "recent",
    view: "grid",
  });
  const [activeItem, setActiveItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0 });

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await searchPublicItems({ query, ...filters });
      const list = res.data.items || [];
      setItems(list);
      setStats({ total: list.length });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [query, filters]);

  return (
    <LayoutWrapper>
      {/* HERO */}
      <section className="repo-hero">
        <div className="container hero-grid">
          <div>
            <h1 className="repo-title">
              Oromo <span>Open Research Repository</span>
            </h1>
            <p className="repo-subtitle">
              A global open-access platform for research papers, theses,
              datasets, and scholarly publications.
            </p>
          </div>

          <div className="repo-stats">
            <div className="stat-box">
              <FiEye />
              <div>
                <strong>{stats.total.toLocaleString()}</strong>
                <span>Public Items</span>
              </div>
            </div>
            <div className="stat-box">
              <FiDownload />
              <div>
                <strong>100%</strong>
                <span>Open Access</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <section className="repo-search">
        <div className="container search-row">
          <SearchBar
            query={query}
            setQuery={setQuery}
            filters={filters}
            setFilters={setFilters}
          />

          <div className="view-switch">
            <button
              className={filters.view === "grid" ? "active" : ""}
              onClick={() => setFilters({ ...filters, view: "grid" })}
            >
              <FiGrid />
            </button>
            <button
              className={filters.view === "list" ? "active" : ""}
              onClick={() => setFilters({ ...filters, view: "list" })}
            >
              <FiList />
            </button>
            <button className="filter-btn">
              <FiFilter /> Filters
            </button>
          </div>
        </div>

        {/* ACTIVE FILTERS */}
        <div className="container active-filters">
          {filters.type !== "all" && (
            <span className="filter-chip">
              <FiType /> {filters.type}
              <button onClick={() => setFilters({ ...filters, type: "all" })}>
                ×
              </button>
            </span>
          )}
          {filters.year !== "all" && (
            <span className="filter-chip">
              <FiCalendar /> {filters.year}
              <button onClick={() => setFilters({ ...filters, year: "all" })}>
                ×
              </button>
            </span>
          )}
        </div>
      </section>

      {/* CONTENT */}
      <section className="repo-content">
        <div className="container">
          {loading ? (
            <div className="loading">
              <div className="spinner" />
              <p>Searching repository…</p>
            </div>
          ) : items.length ? (
            <>
              <h3 className="results-title">
                {items.length} results {query && `for “${query}”`}
              </h3>

              <div className={`items ${filters.view}`}>
                {items.map((item) => (
                  <ItemCard
                    key={item.uuid}
                    item={item}
                    view={filters.view}
                    onOpen={() => setActiveItem(item.uuid)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <h3>No results found</h3>
              <p>Try different keywords or remove filters.</p>
              <button
                onClick={() => {
                  setQuery("");
                  setFilters({
                    type: "all",
                    year: "all",
                    sort: "recent",
                    view: "grid",
                  });
                }}
              >
                Reset Search
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ITEM MODAL */}
      {activeItem && (
        <ItemModal uuid={activeItem} onClose={() => setActiveItem(null)} />
      )}
    </LayoutWrapper>
  );
}
