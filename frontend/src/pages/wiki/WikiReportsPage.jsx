import { useMemo, useRef, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import {
  FaFileAlt,
  FaUsers,
  FaEye,
  FaEdit,
  FaShieldAlt,
  FaDownload,
  FaFilePdf,
  FaFileExcel,
  FaSearch,
  FaChartBar,
  FaHistory,
} from "react-icons/fa";

export default function WikiReportsPage() {
  const printRef = useRef(null);

  const [filters, setFilters] = useState({
    period: "30days",
    status: "all",
    search: "",
  });

  const stats = {
    totalArticles: 21,
    publishedArticles: 12,
    draftArticles: 5,
    underReviewArticles: 3,
    archivedArticles: 1,
    totalUsers: 14,
    totalViews: 18425,
    totalEdits: 286,
    totalCategories: 8,
    totalReports: 6,
    resolvedReports: 4,
    pendingReports: 2,
    activeContributors: 9,
  };

  const monthlyArticles = [
    { month: "Jan", total: 2 },
    { month: "Feb", total: 3 },
    { month: "Mar", total: 4 },
    { month: "Apr", total: 5 },
    { month: "May", total: 2 },
    { month: "Jun", total: 5 },
  ];

  const topArticles = [
    { id: 1, title: "Oromia Regional Health Policy", views: 3200, edits: 21, status: "published", trend: "hot" },
    { id: 2, title: "Digital Health Transformation Guide", views: 2740, edits: 18, status: "published", trend: "hot" },
    { id: 3, title: "Community Health Worker Handbook", views: 2190, edits: 15, status: "published", trend: "rising" },
    { id: 4, title: "Hospital Reporting Standards", views: 1620, edits: 12, status: "published", trend: "rising" },
    { id: 5, title: "Vaccination Outreach Framework", views: 1180, edits: 9, status: "under_review", trend: "normal" },
  ];

  const recentChanges = [
    { id: 1, user: "Abdi F.", article: "Digital Health Transformation Guide", type: "edit", time: "2 hours ago", summary: "Updated section 3 and fixed references" },
    { id: 2, user: "Lensa T.", article: "Community Health Worker Handbook", type: "create", time: "5 hours ago", summary: "Initial article creation" },
    { id: 3, user: "Meron K.", article: "Vaccination Outreach Framework", type: "edit", time: "Yesterday", summary: "Added implementation notes" },
    { id: 4, user: "Robel M.", article: "Hospital Reporting Standards", type: "edit", time: "Yesterday", summary: "Corrected terminology" },
  ];

  const vandalismReports = [
    { id: 1, article: "Oromia Regional Health Policy", reporter: "Editor A", reason: "Suspicious content replacement", status: "pending", date: "2026-04-05" },
    { id: 2, article: "Digital Health Transformation Guide", reporter: "Editor B", reason: "Mass deletion of content", status: "resolved", date: "2026-04-04" },
    { id: 3, article: "Hospital Reporting Standards", reporter: "Moderator C", reason: "Spam external links", status: "resolved", date: "2026-04-03" },
  ];

  const categoryStats = [
    { id: 1, name: "Health Policy", count: 6 },
    { id: 2, name: "Digital Health", count: 4 },
    { id: 3, name: "Public Health", count: 3 },
    { id: 4, name: "Training", count: 2 },
    { id: 5, name: "Research", count: 2 },
    { id: 6, name: "Guidelines", count: 4 },
  ];

  const contributorStats = [
    { id: 1, name: "Abdi F.", articles: 5, edits: 41, role: "Editor" },
    { id: 2, name: "Lensa T.", articles: 4, edits: 35, role: "Contributor" },
    { id: 3, name: "Meron K.", articles: 3, edits: 29, role: "Moderator" },
    { id: 4, name: "Robel M.", articles: 2, edits: 24, role: "Contributor" },
    { id: 5, name: "Hana D.", articles: 2, edits: 18, role: "Editor" },
  ];

  const filteredTopArticles = useMemo(() => {
    return topArticles.filter((item) => {
      const matchesStatus =
        filters.status === "all" ? true : item.status === filters.status;
      const matchesSearch = item.title
        .toLowerCase()
        .includes(filters.search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [filters]);

  const maxMonthly = Math.max(...monthlyArticles.map((m) => m.total), 1);
  const maxViews = Math.max(...topArticles.map((a) => a.views), 1);

  const getStatusBadgeClass = (status) => {
    if (status === "published") return "badge bg-success";
    if (status === "draft") return "badge bg-warning text-dark";
    if (status === "under_review") return "badge bg-info text-white";
    return "badge bg-secondary";
  };

  const getReportBadgeClass = (status) => {
    if (status === "resolved") return "badge bg-success";
    if (status === "pending") return "badge bg-warning text-dark";
    return "badge bg-danger";
  };

  const exportExcel = () => {
    const rows = [
      ["Wiki Reports Summary"],
      [],
      ["Metric", "Value"],
      ["Total Articles", stats.totalArticles],
      ["Published Articles", stats.publishedArticles],
      ["Draft Articles", stats.draftArticles],
      ["Under Review Articles", stats.underReviewArticles],
      ["Archived Articles", stats.archivedArticles],
      ["Total Users", stats.totalUsers],
      ["Total Views", stats.totalViews],
      ["Total Edits", stats.totalEdits],
      ["Total Categories", stats.totalCategories],
      ["Pending Reports", stats.pendingReports],
      [],
      ["Top Popular Articles"],
      ["Title", "Views", "Edits", "Status", "Trend"],
      ...filteredTopArticles.map((a) => [a.title, a.views, a.edits, a.status, a.trend]),
      [],
      ["Recent Changes"],
      ["User", "Article", "Type", "Time", "Summary"],
      ...recentChanges.map((c) => [c.user, c.article, c.type, c.time, c.summary]),
      [],
      ["Moderation Reports"],
      ["Article", "Reporter", "Reason", "Status", "Date"],
      ...vandalismReports.map((r) => [r.article, r.reporter, r.reason, r.status, r.date]),
    ];

    const csvContent = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "wiki-reports.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const content = printRef.current?.innerHTML;
    const win = window.open("", "_blank", "width=1200,height=900");

    if (!win || !content) return;

    win.document.write(`
      <html>
        <head>
          <title>Wiki Reports</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
            h1, h2, h3 { margin: 0 0 12px; }
            .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
            .card { border: 1px solid #ddd; border-radius: 8px; padding: 14px; }
            .muted { color: #666; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; text-align: left; }
            th { background: #f5f5f5; }
            .section { margin-bottom: 24px; }
          </style>
        </head>
        <body>
          <h1>Wiki Reports Dashboard</h1>
          <div class="muted">Mock data export</div>
          ${content}
        </body>
      </html>
    `);

    win.document.close();
    win.focus();
    win.print();
  };

  const SummaryCard = ({ icon, title, value, subtitle }) => (
    <div className="col-lg-3 col-md-6 mb-3">
      <div className="card shadow-sm border-0 h-100">
        <div className="card-body d-flex align-items-center">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center me-3"
            style={{
              width: 48,
              height: 48,
              background: "#f4f6f9",
              fontSize: 18,
            }}
          >
            {icon}
          </div>
          <div>
            <div className="text-muted small">{title}</div>
            <div className="h4 mb-0 fw-bold">{value}</div>
            {subtitle ? <div className="small text-muted">{subtitle}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid mt-4">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div>
              <h2 className="mb-1">Wiki Reports</h2>
              <p className="text-muted mb-0">
                Simple report cards, charts, and export actions
              </p>
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-outline-danger me-2" onClick={exportPDF}>
                <FaFilePdf className="me-2" />
                PDF
              </button>
              <button className="btn btn-outline-success" onClick={exportExcel}>
                <FaFileExcel className="me-2" />
                Excel
              </button>
            </div>
          </div>

          <div ref={printRef}>
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Period</label>
                    <select
                      className="form-control"
                      value={filters.period}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, period: e.target.value }))
                      }
                    >
                      <option value="7days">Last 7 days</option>
                      <option value="30days">Last 30 days</option>
                      <option value="90days">Last 90 days</option>
                      <option value="year">This year</option>
                    </select>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label">Article Status</label>
                    <select
                      className="form-control"
                      value={filters.status}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, status: e.target.value }))
                      }
                    >
                      <option value="all">All</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="under_review">Under Review</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Search Article</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaSearch />
                      </span>
                      <input
                        className="form-control"
                        placeholder="Search by article title..."
                        value={filters.search}
                        onChange={(e) =>
                          setFilters((prev) => ({ ...prev, search: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <SummaryCard
                icon={<FaFileAlt className="text-primary" />}
                title="Total Articles"
                value={stats.totalArticles}
                subtitle={`${stats.publishedArticles} published`}
              />
              <SummaryCard
                icon={<FaEye className="text-success" />}
                title="Total Views"
                value={stats.totalViews}
                subtitle="All article views"
              />
              <SummaryCard
                icon={<FaEdit className="text-warning" />}
                title="Total Edits"
                value={stats.totalEdits}
                subtitle="Revision activity"
              />
              <SummaryCard
                icon={<FaShieldAlt className="text-danger" />}
                title="Pending Reports"
                value={stats.pendingReports}
                subtitle={`${stats.resolvedReports} resolved`}
              />
            </div>

            <div className="row">
              <div className="col-lg-7 mb-4">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-header bg-white">
                    <h5 className="mb-0">
                      <FaChartBar className="me-2 text-primary" />
                      Monthly Article Chart
                    </h5>
                  </div>
                  <div className="card-body">
                    {monthlyArticles.map((item) => (
                      <div key={item.month} className="mb-3">
                        <div className="d-flex justify-content-between small mb-1">
                          <span>{item.month}</span>
                          <strong>{item.total}</strong>
                        </div>
                        <div className="progress" style={{ height: "12px" }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${(item.total / maxMonthly) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}

                    <hr />

                    <div className="row text-center">
                      <div className="col-3">
                        <div className="border rounded p-2">
                          <div className="fw-bold text-success">{stats.publishedArticles}</div>
                          <div className="small text-muted">Published</div>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="border rounded p-2">
                          <div className="fw-bold text-warning">{stats.draftArticles}</div>
                          <div className="small text-muted">Drafts</div>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="border rounded p-2">
                          <div className="fw-bold text-info">{stats.underReviewArticles}</div>
                          <div className="small text-muted">Under Review</div>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="border rounded p-2">
                          <div className="fw-bold text-secondary">{stats.archivedArticles}</div>
                          <div className="small text-muted">Archived</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-5 mb-4">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-header bg-white">
                    <h5 className="mb-0">Top Article Views</h5>
                  </div>
                  <div className="card-body">
                    {filteredTopArticles.map((article) => (
                      <div key={article.id} className="mb-3">
                        <div className="d-flex justify-content-between small mb-1">
                          <span className="text-truncate pe-3">{article.title}</span>
                          <strong>{article.views}</strong>
                        </div>
                        <div className="progress" style={{ height: "10px" }}>
                          <div
                            className="progress-bar bg-success"
                            style={{ width: `${(article.views / maxViews) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}

                    <hr />

                    <div className="row">
                      <div className="col-6 mb-2">
                        <div className="border rounded p-3 text-center">
                          <FaUsers className="text-primary mb-2" />
                          <div className="fw-bold">{stats.totalUsers}</div>
                          <div className="small text-muted">Wiki Users</div>
                        </div>
                      </div>
                      <div className="col-6 mb-2">
                        <div className="border rounded p-3 text-center">
                          <FaHistory className="text-warning mb-2" />
                          <div className="fw-bold">{stats.activeContributors}</div>
                          <div className="small text-muted">Contributors</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="border rounded p-3 text-center">
                          <FaFileAlt className="text-info mb-2" />
                          <div className="fw-bold">{stats.totalCategories}</div>
                          <div className="small text-muted">Categories</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="border rounded p-3 text-center">
                          <FaShieldAlt className="text-danger mb-2" />
                          <div className="fw-bold">{stats.totalReports}</div>
                          <div className="small text-muted">Reports</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-7 mb-4">
                <div className="card shadow-sm border-0">
                  <div className="card-header bg-white">
                    <h5 className="mb-0">Popular Articles</h5>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Article</th>
                          <th>Views</th>
                          <th>Edits</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTopArticles.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center text-muted py-4">
                              No matching articles found
                            </td>
                          </tr>
                        ) : (
                          filteredTopArticles.map((article, index) => (
                            <tr key={article.id}>
                              <td>{index + 1}</td>
                              <td>{article.title}</td>
                              <td>{article.views}</td>
                              <td>{article.edits}</td>
                              <td>
                                <span className={getStatusBadgeClass(article.status)}>
                                  {article.status.replace("_", " ")}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="col-lg-5 mb-4">
                <div className="card shadow-sm border-0">
                  <div className="card-header bg-white">
                    <h5 className="mb-0">Recent Changes</h5>
                  </div>
                  <div className="card-body">
                    {recentChanges.map((change) => (
                      <div key={change.id} className="border rounded p-3 mb-3">
                        <div className="d-flex justify-content-between">
                          <strong>{change.article}</strong>
                          <span className={`badge ${change.type === "create" ? "bg-success" : "bg-primary"}`}>
                            {change.type}
                          </span>
                        </div>
                        <div className="small text-muted mt-1">
                          {change.user} • {change.time}
                        </div>
                        <div className="small mt-2">{change.summary}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-6 mb-4">
                <div className="card shadow-sm border-0">
                  <div className="card-header bg-white">
                    <h5 className="mb-0">Top Contributors</h5>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-striped mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>User</th>
                          <th>Role</th>
                          <th>Articles</th>
                          <th>Edits</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contributorStats.map((user) => (
                          <tr key={user.id}>
                            <td>{user.name}</td>
                            <td><span className="badge bg-info">{user.role}</span></td>
                            <td>{user.articles}</td>
                            <td>{user.edits}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="col-lg-6 mb-4">
                <div className="card shadow-sm border-0">
                  <div className="card-header bg-white">
                    <h5 className="mb-0">Moderation Reports</h5>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Article</th>
                          <th>Reporter</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vandalismReports.map((report) => (
                          <tr key={report.id}>
                            <td>{report.article}</td>
                            <td>{report.reporter}</td>
                            <td>
                              <span className={getReportBadgeClass(report.status)}>
                                {report.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">Category Distribution</h5>
              </div>
              <div className="card-body">
                {categoryStats.map((cat) => (
                  <div key={cat.id} className="mb-3">
                    <div className="d-flex justify-content-between small mb-1">
                      <span>{cat.name}</span>
                      <strong>{cat.count}</strong>
                    </div>
                    <div className="progress" style={{ height: "10px" }}>
                      <div
                        className="progress-bar bg-info"
                        style={{ width: `${(cat.count / stats.totalArticles) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="alert alert-light border">
            <strong>Note:</strong> PDF export uses browser print. Excel export downloads CSV, which opens in Excel.
          </div>
        </div>
      </section>
    </MainLayout>
  );
}