import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import axios from "axios";
import { formatDistanceToNow, format } from "date-fns";

/* ============================
   AXIOS INSTANCE (IMPORTANT)
============================ */

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ============================
   COMPONENT
============================ */

export default function OromoWikipedia() {
  const [activeTab, setActiveTab] = useState("submissions");

  const [loading, setLoading] = useState({
    stats: true,
    articles: true,
    activity: true,
    media: true,
  });

  const [wikiStats, setWikiStats] = useState(null);
  const [recentArticles, setRecentArticles] = useState([]);
  const [popularArticles, setPopularArticles] = useState([]);
  const [mediaStats, setMediaStats] = useState(null);
  const [languageStats, setLanguageStats] = useState([]);
  const [userMedia, setUserMedia] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /* ============================
     FETCH DASHBOARD DATA
  ============================ */

  const fetchDashboardData = async () => {
    try {
      setLoading((prev) => ({ ...prev, stats: true }));

      const statsRes = await api.get("/wiki/articles/stats");
      if (statsRes.data.success) {
        setWikiStats(statsRes.data.data);
      }

      const recentRes = await api.get(
        "/wiki/articles/recent?limit=6"
      );
      if (recentRes.data.success) {
        setRecentArticles(recentRes.data.data);
      }

      const popularRes = await api.get(
        "/wiki/articles/popular?limit=6"
      );
      if (popularRes.data.success) {
        setPopularArticles(popularRes.data.data);
      }

      const langRes = await api.get(
        "/wiki/articles/languages/stats"
      );
      if (langRes.data.success) {
        setLanguageStats(langRes.data.data);
      }

      const mediaStatsRes = await api.get("/wiki/media/stats");
      if (mediaStatsRes.data.success) {
        setMediaStats(mediaStatsRes.data.data);
      }

      const mediaRes = await api.get("/wiki/media/user/me");
      if (mediaRes.data.success) {
        setUserMedia(mediaRes.data.data);
      }

    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading({
        stats: false,
        articles: false,
        activity: false,
        media: false,
      });
    }
  };

  /* ============================
     HELPERS
  ============================ */

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return "";
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
      });
    } catch {
      return "";
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      published: "badge bg-success",
      draft: "badge bg-secondary",
      under_review: "badge bg-warning",
      archived: "badge bg-danger",
    };
    return (
      <span className={map[status] || "badge bg-info"}>
        {status}
      </span>
    );
  };

  /* ============================
     UI
  ============================ */

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          {/* Stats */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card p-3 text-center">
                <h5>Total Articles</h5>
                <h3>
                  {loading.stats
                    ? "Loading..."
                    : wikiStats?.total_articles || 0}
                </h3>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card p-3 text-center">
                <h5>Total Edits</h5>
                <h3>
                  {loading.stats
                    ? "Loading..."
                    : wikiStats?.total_edits || 0}
                </h3>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card p-3 text-center">
                <h5>Media Files</h5>
                <h3>
                  {loading.media
                    ? "Loading..."
                    : mediaStats?.total_media || 0}
                </h3>
              </div>
            </div>
          </div>

          {/* Recent Articles */}
          <div className="card mb-4">
            <div className="card-header">
              <h5>Recent Articles</h5>
            </div>
            <div className="card-body">
              {loading.articles ? (
                <p>Loading...</p>
              ) : recentArticles.length === 0 ? (
                <p>No articles found.</p>
              ) : (
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Views</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentArticles.map((article) => (
                      <tr key={article.id}>
                        <td>
                          <a
                            href={`/wiki/article/${article.slug}`}
                          >
                            {article.title}
                          </a>
                        </td>
                        <td>
                          {getStatusBadge(article.status)}
                        </td>
                        <td>
                          {article.view_count || 0}
                        </td>
                        <td>
                          {formatDate(article.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Popular Articles */}
          <div className="card mb-4">
            <div className="card-header">
              <h5>Popular Articles</h5>
            </div>
            <div className="card-body">
              {popularArticles.length === 0 ? (
                <p>No popular articles.</p>
              ) : (
                <div className="row">
                  {popularArticles.map((article) => (
                    <div
                      className="col-md-4 mb-3"
                      key={article.id}
                    >
                      <div className="card p-3">
                        <h6>{article.title}</h6>
                        <small>
                          {formatRelativeTime(
                            article.created_at
                          )}
                        </small>
                        <div>
                          👁 {article.view_count || 0}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </section>
    </MainLayout>
  );
}