import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { publicationAPI } from "../../api/repository/public.api";

export default function RepositoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalDownloads: 0,
    totalContributors: 0,
  });
  const [loading, setLoading] = useState({
    featured: true,
    categories: true,
    stats: true,
  });

  useEffect(() => {
    fetchFeaturedItems();
    fetchCategories();
    fetchStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        handleSearch();
      } else if (searchQuery.trim().length === 0) {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchFeaturedItems = async () => {
    try {
      setLoading((prev) => ({ ...prev, featured: true }));
      const res = await publicationAPI.getRecentItems(6);
      setFeaturedItems(Array.isArray(res?.items) ? res.items : []);
    } catch (error) {
      console.error("fetchFeaturedItems error:", error);
      setFeaturedItems([]);
    } finally {
      setLoading((prev) => ({ ...prev, featured: false }));
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading((prev) => ({ ...prev, categories: true }));
      const res = await publicationAPI.searchPublicItems(
        "",
        1,
        100,
        "all",
        "all",
        "recent"
      );

      const categoryMap = new Map();

      (res?.items || []).forEach((item) => {
        const cat = item.item_type || "Uncategorized";

        if (!categoryMap.has(cat)) {
          categoryMap.set(cat, {
            name: cat,
            count: 0,
            icon: getCategoryIcon(cat),
            color: getCategoryColor(cat),
          });
        }

        categoryMap.get(cat).count += 1;
      });

      setCategories(Array.from(categoryMap.values()));
    } catch (error) {
      console.error("fetchCategories error:", error);
      setCategories([]);
    } finally {
      setLoading((prev) => ({ ...prev, categories: false }));
    }
  };

  const fetchStats = async () => {
    try {
      setLoading((prev) => ({ ...prev, stats: true }));
      const res = await publicationAPI.getRepositoryStats();
      setStats({
        totalItems: res?.totalItems || 0,
        totalDownloads: res?.totalDownloads || 0,
        totalContributors: res?.totalContributors || 0,
      });
    } catch (error) {
      console.error("fetchStats error:", error);
      setStats({
        totalItems: 0,
        totalDownloads: 0,
        totalContributors: 0,
      });
    } finally {
      setLoading((prev) => ({ ...prev, stats: false }));
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await publicationAPI.searchPublicItems(
        searchQuery,
        1,
        10,
        "all",
        "all",
        "recent"
      );
      setSearchResults(Array.isArray(res?.items) ? res.items : []);
    } catch (error) {
      console.error("handleSearch error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleItemClick = async (uuid) => {
    try {
      await publicationAPI.trackView(uuid);
    } catch (error) {
      console.error("trackView error:", error);
    }
  };

  const handleDownload = async (uuid, e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await publicationAPI.trackDownload(uuid);
      window.open(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:5000/api"
        }/repository/public/item/${uuid}/download`,
        "_blank"
      );
    } catch (error) {
      console.error("trackDownload error:", error);
    }
  };

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return String(num);
  };

  const formatYear = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.getFullYear();
  };

  const getItemLabel = (item) => item?.item_type || "Repository Item";

  const getAuthorLabel = (item) =>
    item?.author || item?.creator || item?.submitter_name || "Unknown Author";

  const getCategoryIcon = (category) => {
    const icons = {
      "Journal Article": "fas fa-newspaper",
      Thesis: "fas fa-book",
      Dissertation: "fas fa-user-graduate",
      Dataset: "fas fa-chart-bar",
      Book: "fas fa-book-open",
      "Conference Paper": "fas fa-file-alt",
      "Policy Paper": "fas fa-landmark",
      Collection: "fas fa-folder-open",
      Report: "fas fa-file-invoice",
      Manuscript: "fas fa-pen-nib",
      "Research Paper": "fas fa-file-medical-alt",
      "Historical Document": "fas fa-scroll",
      "Audio Recording": "fas fa-music",
      Video: "fas fa-video",
      Photograph: "fas fa-image",
    };

    return icons[category] || "fas fa-folder";
  };

  const getCategoryColor = (category) => {
    const colors = {
      "Journal Article": "#17a2b8",
      Thesis: "#007bff",
      Dissertation: "#6f42c1",
      Dataset: "#6610f2",
      Book: "#fd7e14",
      "Conference Paper": "#20c997",
      "Policy Paper": "#343a40",
      Collection: "#28a745",
      Report: "#ffc107",
      Manuscript: "#b8860b",
      "Research Paper": "#b8860b",
      "Historical Document": "#17a2b8",
      "Audio Recording": "#28a745",
      Video: "#dc3545",
      Photograph: "#e83e8c",
    };

    return colors[category] || "#6c757d";
  };

  const hasSearchResults = useMemo(
    () => Array.isArray(searchResults) && searchResults.length > 0,
    [searchResults]
  );

  return (
    <>
      <Navbar />

      <div className="content-wrapper repository-public-page" style={{ marginLeft: 0, minHeight: "100vh" }}>
        <section className="repository-hero">
          <div className="container py-5">
            <div className="row justify-content-center text-center">
              <div className="col-lg-10">
                <div className="repo-badge mb-3">
                  <i className="fas fa-book-reader mr-2" />
                  Digital Repository
                </div>

                <h1 className="repo-title mb-3">
                  Oromo Knowledge Archive
                </h1>

                <p className="repo-subtitle mb-4">
                  Preserving Oromo cultural heritage, historical documents,
                  academic research, and community knowledge in one trusted digital archive.
                </p>

                <div className="repo-search-box">
                  <div className="input-group input-group-lg">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search articles, theses, books, reports, datasets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="input-group-append">
                      <button
                        type="button"
                        className="btn btn-warning"
                        onClick={handleSearch}
                        disabled={isSearching}
                      >
                        {isSearching ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2" />
                            Searching...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-search mr-2" />
                            Search
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {hasSearchResults && (
                    <div className="repo-search-results shadow">
                      <div className="repo-search-results-header">
                        <span>Search Results</span>
                        <span className="badge badge-light">
                          {searchResults.length} items
                        </span>
                      </div>

                      {searchResults.map((item) => (
                        <Link
                          key={item.uuid}
                          to={`/repository/item/${item.uuid}`}
                          className="repo-search-result-item"
                          onClick={() => handleItemClick(item.uuid)}
                        >
                          <div
                            className="repo-search-result-icon"
                            style={{
                              backgroundColor: `${getCategoryColor(getItemLabel(item))}20`,
                              color: getCategoryColor(getItemLabel(item)),
                            }}
                          >
                            <i className={getCategoryIcon(getItemLabel(item))} />
                          </div>

                          <div className="repo-search-result-content">
                            <div className="repo-search-result-title">
                              {item.title}
                            </div>
                            <div className="repo-search-result-meta">
                              <span>{getAuthorLabel(item)}</span>
                              <span>• {formatYear(item.created_at)}</span>
                              <span>• ⬇ {formatNumber(item.downloads)}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="row mt-5">
                  <div className="col-md-4 mb-3">
                    <div className="small-box bg-info repo-stat-box">
                      <div className="inner">
                        <h3>{loading.stats ? "..." : formatNumber(stats.totalItems)}</h3>
                        <p>Total Repository Items</p>
                      </div>
                      <div className="icon">
                        <i className="fas fa-folder-open" />
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4 mb-3">
                    <div className="small-box bg-success repo-stat-box">
                      <div className="inner">
                        <h3>{loading.stats ? "..." : formatNumber(stats.totalDownloads)}</h3>
                        <p>Total Downloads</p>
                      </div>
                      <div className="icon">
                        <i className="fas fa-download" />
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4 mb-3">
                    <div className="small-box bg-warning repo-stat-box">
                      <div className="inner">
                        <h3>{loading.stats ? "..." : formatNumber(stats.totalContributors)}</h3>
                        <p>Total Contributors</p>
                      </div>
                      <div className="icon">
                        <i className="fas fa-users" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Link to="/repository/browse" className="btn btn-outline-light btn-lg mr-2 mb-2">
                    <i className="fas fa-th-large mr-2" />
                    Browse All
                  </Link>
                  <Link to="/repository/author/create" className="btn btn-warning btn-lg mb-2">
                    <i className="fas fa-upload mr-2" />
                    Contribute
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="content py-5">
          <div className="container">
            <div className="text-center mb-4">
              <h2 className="section-title">Browse by Category</h2>
              <p className="text-muted mb-0">
                Discover materials organized by repository item type
              </p>
            </div>

            <div className="row">
              {loading.categories ? (
                <div className="col-12 text-center py-5">
                  <i className="fas fa-spinner fa-spin mr-2" />
                  Loading categories...
                </div>
              ) : categories.length > 0 ? (
                categories.map((cat) => (
                  <div className="col-lg-3 col-md-4 col-sm-6 mb-4" key={cat.name}>
                    <Link
                      to={`/repository/category/${encodeURIComponent(cat.name)}`}
                      className="text-decoration-none"
                    >
                      <div className="card repo-category-card h-100">
                        <div className="card-body text-center">
                          <div
                            className="repo-category-icon mx-auto mb-3"
                            style={{
                              backgroundColor: `${cat.color}20`,
                              color: cat.color,
                            }}
                          >
                            <i className={getCategoryIcon(cat.name)} />
                          </div>
                          <h5 className="repo-category-title">{cat.name}</h5>
                          <p className="text-muted mb-0">
                            {formatNumber(cat.count)} {cat.count === 1 ? "item" : "items"}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="alert alert-light border text-center">
                    No categories found.
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="content pb-5">
          <div className="container">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
              <div>
                <h2 className="section-title mb-1">Featured Items</h2>
                <p className="text-muted mb-0">
                  Most recent publicly available repository materials
                </p>
              </div>
              <Link to="/repository/browse" className="btn btn-outline-primary mt-2 mt-md-0">
                View All
              </Link>
            </div>

            <div className="row">
              {loading.featured ? (
                <div className="col-12 text-center py-5">
                  <i className="fas fa-spinner fa-spin mr-2" />
                  Loading featured items...
                </div>
              ) : featuredItems.length > 0 ? (
                featuredItems.map((item) => (
                  <div className="col-lg-4 col-md-6 mb-4" key={item.uuid}>
                    <Link
                      to={`/repository/item/${item.uuid}`}
                      className="text-decoration-none"
                      onClick={() => handleItemClick(item.uuid)}
                    >
                      <div className="card repo-featured-card h-100">
                        <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center pt-3">
                          <div
                            className="repo-featured-icon"
                            style={{
                              backgroundColor: `${getCategoryColor(getItemLabel(item))}20`,
                              color: getCategoryColor(getItemLabel(item)),
                            }}
                          >
                            <i className={getCategoryIcon(getItemLabel(item))} />
                          </div>

                          <span className="badge badge-warning px-3 py-2">
                            {getItemLabel(item)}
                          </span>
                        </div>

                        <div className="card-body">
                          <h5 className="repo-featured-title">{item.title}</h5>
                          <p className="repo-featured-author mb-3">
                            By {getAuthorLabel(item)}
                          </p>

                          <div className="d-flex justify-content-between flex-wrap text-muted small mb-3">
                            <span>
                              <i className="fas fa-calendar-alt mr-1" />
                              {formatYear(item.created_at)}
                            </span>
                            <span>
                              <i className="fas fa-download mr-1" />
                              {formatNumber(item.downloads)}
                            </span>
                          </div>
                        </div>

                        <div className="card-footer bg-white border-0 pb-3">
                          <button
                            type="button"
                            className="btn btn-outline-warning btn-block"
                            onClick={(e) => handleDownload(item.uuid, e)}
                          >
                            <i className="fas fa-download mr-2" />
                            Download
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="alert alert-light border text-center">
                    No featured items found.
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="content pb-5">
          <div className="container">
            <div className="card repo-contribute-card">
              <div className="card-body p-4 p-md-5">
                <div className="row align-items-center">
                  <div className="col-lg-8">
                    <h3 className="mb-3">Share Your Knowledge With the Archive</h3>
                    <p className="text-muted mb-4">
                      Help preserve Oromo heritage by contributing research papers,
                      oral histories, books, reports, photographs, and other valuable materials.
                    </p>

                    <div className="row">
                      <div className="col-sm-6 col-lg-3 mb-2">
                        <div className="repo-mini-feature">
                          <i className="fas fa-file-alt text-primary mr-2" />
                          Academic Papers
                        </div>
                      </div>
                      <div className="col-sm-6 col-lg-3 mb-2">
                        <div className="repo-mini-feature">
                          <i className="fas fa-microphone text-success mr-2" />
                          Oral Histories
                        </div>
                      </div>
                      <div className="col-sm-6 col-lg-3 mb-2">
                        <div className="repo-mini-feature">
                          <i className="fas fa-camera text-warning mr-2" />
                          Photographs
                        </div>
                      </div>
                      <div className="col-sm-6 col-lg-3 mb-2">
                        <div className="repo-mini-feature">
                          <i className="fas fa-scroll text-info mr-2" />
                          Historical Docs
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 text-lg-right mt-4 mt-lg-0">
                    <Link
                      to="/repository/author/create"
                      className="btn btn-warning btn-lg mb-2 mr-lg-2"
                    >
                      <i className="fas fa-plus-circle mr-2" />
                      Start Contributing
                    </Link>
                    <Link
                      to="/repository/guidelines"
                      className="btn btn-outline-secondary btn-lg mb-2"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="main-footer text-center">
          <strong>© {new Date().getFullYear()} Oromo Researcher Association.</strong>{" "}
          All rights reserved.
        </footer>
      </div>

      <style>{`
        .repository-public-page {
          background: #f4f6f9;
        }

        .repository-hero {
          background: linear-gradient(135deg, #0b2a20 0%, #14532d 45%, #1f5f8b 100%);
          color: #fff;
          position: relative;
          overflow: hidden;
        }

        .repository-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at top right, rgba(255,255,255,0.12), transparent 30%),
            radial-gradient(circle at bottom left, rgba(255,193,7,0.18), transparent 28%);
          pointer-events: none;
        }

        .repo-badge {
          display: inline-block;
          padding: 10px 18px;
          border-radius: 999px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.18);
          font-weight: 600;
          backdrop-filter: blur(8px);
        }

        .repo-title {
          font-size: 3rem;
          font-weight: 800;
          line-height: 1.15;
        }

        .repo-subtitle {
          max-width: 760px;
          margin: 0 auto;
          font-size: 1.1rem;
          color: rgba(255,255,255,0.92);
        }

        .repo-search-box {
          max-width: 850px;
          margin: 0 auto;
          position: relative;
        }

        .repo-search-results {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          z-index: 999;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #dee2e6;
        }

        .repo-search-results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
          font-weight: 600;
        }

        .repo-search-result-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          text-decoration: none;
          color: inherit;
          border-bottom: 1px solid #f1f1f1;
          transition: background 0.2s ease;
        }

        .repo-search-result-item:last-child {
          border-bottom: none;
        }

        .repo-search-result-item:hover {
          background: #f8f9fa;
          text-decoration: none;
          color: inherit;
        }

        .repo-search-result-icon {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
          flex-shrink: 0;
        }

        .repo-search-result-title {
          font-weight: 700;
          margin-bottom: 3px;
        }

        .repo-search-result-meta {
          font-size: 0.875rem;
          color: #6c757d;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .repo-stat-box {
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
        }

        .section-title {
          font-weight: 700;
          color: #2c3e50;
        }

        .repo-category-card,
        .repo-featured-card,
        .repo-contribute-card {
          border: 0;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .repo-category-card:hover,
        .repo-featured-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 32px rgba(0,0,0,0.12);
        }

        .repo-category-icon,
        .repo-featured-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .repo-category-title,
        .repo-featured-title {
          color: #2c3e50;
          font-weight: 700;
        }

        .repo-featured-author {
          color: #6c757d;
        }

        .repo-mini-feature {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          padding: 10px 14px;
          border-radius: 10px;
          font-weight: 600;
        }

        @media (max-width: 991.98px) {
          .repo-title {
            font-size: 2.35rem;
          }
        }

        @media (max-width: 767.98px) {
          .repo-title {
            font-size: 2rem;
          }

          .repo-search-results {
            position: static;
            margin-top: 10px;
          }
        }
      `}</style>
    </>
  );
}