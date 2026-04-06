import { useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import {
  FaUserCircle,
  FaEdit,
  FaEye,
  FaFileAlt,
  FaHistory,
  FaGlobe,
  FaEnvelope,
  FaCalendarAlt,
  FaAward,
  FaStar,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaLanguage,
  FaShieldAlt,
} from "react-icons/fa";

export default function WikiProfilePage() {
  const [profile] = useState({
    id: "u-001",
    username: "AbdiWiki",
    displayName: "Abdi Fikru",
    email: "abdi@example.com",
    role: "Local Administrator",
    avatar: "",
    bio: "Public health knowledge contributor and local wiki administrator focusing on policy, digital health, and community documentation.",
    location: "Adama, Ethiopia",
    joinedAt: "2024-03-11",
    language: "English / Afaan Oromo",
    reputation: 1240,
    articlesCreated: 18,
    totalEdits: 143,
    totalViews: 8420,
    badges: ["Trusted Editor", "Top Contributor", "Policy Reviewer", "Community Mentor"],
    topArticles: [
      { id: 1, title: "Oromia Regional Health Policy", views: 3200, status: "published" },
      { id: 2, title: "Digital Health Transformation Guide", views: 2740, status: "published" },
      { id: 3, title: "Community Health Worker Handbook", views: 2190, status: "published" },
    ],
    recentActivity: [
      { id: 1, action: "Edited article", target: "Digital Health Transformation Guide", time: "2 hours ago" },
      { id: 2, action: "Reviewed policy update", target: "Small Medical Wiki", time: "Yesterday" },
      { id: 3, action: "Created article", target: "Hospital Reporting Standards", time: "2 days ago" },
      { id: 4, action: "Resolved vandalism report", target: "Public Health Wiki", time: "4 days ago" },
    ],
  });

  const getStatusBadge = (status) => {
    if (status === "published") return "badge bg-success";
    if (status === "draft") return "badge bg-warning text-dark";
    if (status === "under_review") return "badge bg-info text-white";
    return "badge bg-secondary";
  };

  const StatCard = ({ icon, value, label, color }) => (
    <div className="col-md-4 mb-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body d-flex align-items-center">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center me-3"
            style={{
              width: 54,
              height: 54,
              backgroundColor: "#f4f6f9",
              fontSize: "1.2rem",
            }}
          >
            <span className={color}>{icon}</span>
          </div>
          <div>
            <h4 className="mb-0 fw-bold">{value}</h4>
            <div className="text-muted small">{label}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid mt-4">
          {/* HERO HEADER */}
          <div
            className="card border-0 shadow-sm mb-4 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0d6efd 0%, #3d7bfd 45%, #6ea8fe 100%)",
            }}
          >
            <div className="card-body text-white p-4">
              <div className="row align-items-center">
                <div className="col-lg-8">
                  <div className="d-flex align-items-center flex-wrap">
                    <div className="me-4 mb-3 mb-md-0">
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt={profile.displayName}
                          className="img-circle"
                          style={{
                            width: 110,
                            height: 110,
                            objectFit: "cover",
                            border: "4px solid rgba(255,255,255,0.35)",
                          }}
                        />
                      ) : (
                        <div
                          className="d-flex align-items-center justify-content-center rounded-circle bg-white"
                          style={{
                            width: 110,
                            height: 110,
                            color: "#0d6efd",
                            border: "4px solid rgba(255,255,255,0.35)",
                          }}
                        >
                          <FaUserCircle size={88} />
                        </div>
                      )}
                    </div>

                    <div>
                      <h2 className="mb-1 fw-bold">{profile.displayName}</h2>
                      <div className="mb-2 opacity-75">@{profile.username}</div>

                      <div className="d-flex flex-wrap gap-2 mb-3">
                        <span className="badge bg-light text-primary px-3 py-2">
                          <FaShieldAlt className="me-2" />
                          {profile.role}
                        </span>
                        <span className="badge bg-warning text-dark px-3 py-2">
                          <FaStar className="me-2" />
                          {profile.reputation} Reputation
                        </span>
                      </div>

                      <p className="mb-0" style={{ maxWidth: 760 }}>
                        {profile.bio}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
                  <button className="btn btn-light px-4 py-2 shadow-sm">
                    <FaEdit className="me-2 text-primary" />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {/* LEFT SIDE */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-0">
                  <h5 className="mb-0 fw-bold">Profile Details</h5>
                </div>
                <div className="card-body p-0">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="fw-semibold">
                        <FaEnvelope className="me-2 text-primary" />
                        Email
                      </span>
                      <span className="text-muted">{profile.email}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="fw-semibold">
                        <FaMapMarkerAlt className="me-2 text-danger" />
                        Location
                      </span>
                      <span className="text-muted">{profile.location}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="fw-semibold">
                        <FaCalendarAlt className="me-2 text-success" />
                        Joined
                      </span>
                      <span className="text-muted">{profile.joinedAt}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="fw-semibold">
                        <FaLanguage className="me-2 text-info" />
                        Language
                      </span>
                      <span className="text-muted">{profile.language}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="fw-semibold">
                        <FaGlobe className="me-2 text-secondary" />
                        Wiki Role
                      </span>
                      <span className="badge bg-primary">{profile.role}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-0">
                  <h5 className="mb-0 fw-bold">Badges & Recognition</h5>
                </div>
                <div className="card-body">
                  <div className="d-flex flex-wrap">
                    {profile.badges.map((badge, index) => (
                      <span
                        key={index}
                        className="badge rounded-pill bg-warning text-dark px-3 py-2 me-2 mb-2"
                        style={{ fontSize: "0.85rem" }}
                      >
                        <FaAward className="me-2" />
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0">
                  <h5 className="mb-0 fw-bold">Profile Completion</h5>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Completion progress</span>
                    <span className="fw-bold text-success">88%</span>
                  </div>
                  <div className="progress" style={{ height: "12px" }}>
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{ width: "88%" }}
                    />
                  </div>
                  <p className="mt-3 mb-0 text-muted">
                    <FaCheckCircle className="me-2 text-success" />
                    Your wiki profile is well completed and ready for community visibility.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="col-lg-8">
              <div className="row">
                <StatCard
                  icon={<FaFileAlt />}
                  value={profile.articlesCreated}
                  label="Articles Created"
                  color="text-primary"
                />
                <StatCard
                  icon={<FaEdit />}
                  value={profile.totalEdits}
                  label="Total Edits"
                  color="text-success"
                />
                <StatCard
                  icon={<FaEye />}
                  value={profile.totalViews}
                  label="Total Views"
                  color="text-warning"
                />
              </div>

              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">Recent Activity</h5>
                  <span className="badge bg-light text-dark">Latest contributions</span>
                </div>
                <div className="card-body">
                  {profile.recentActivity.map((item, index) => (
                    <div key={item.id} className={`d-flex ${index !== profile.recentActivity.length - 1 ? "mb-4" : ""}`}>
                      <div className="me-3 d-flex flex-column align-items-center">
                        <div
                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                          style={{ width: 38, height: 38 }}
                        >
                          <FaHistory size={14} />
                        </div>
                        {index !== profile.recentActivity.length - 1 && (
                          <div
                            style={{
                              width: 2,
                              flex: 1,
                              background: "#dee2e6",
                              marginTop: 8,
                              minHeight: 28,
                            }}
                          />
                        )}
                      </div>

                      <div className="flex-grow-1 border rounded p-3 bg-white">
                        <div className="d-flex justify-content-between flex-wrap gap-2">
                          <h6 className="mb-1 fw-bold">{item.action}</h6>
                          <span className="text-muted small">{item.time}</span>
                        </div>
                        <div className="text-muted">{item.target}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">Top Articles</h5>
                  <span className="badge bg-light text-dark">Most viewed content</span>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ minWidth: 260 }}>Title</th>
                          <th>Views</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profile.topArticles.map((article) => (
                          <tr key={article.id}>
                            <td>
                              <div className="fw-semibold">{article.title}</div>
                            </td>
                            <td>
                              <span className="fw-bold text-dark">{article.views}</span>
                            </td>
                            <td>
                              <span className={getStatusBadge(article.status)}>
                                {article.status}
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
          </div>
        </div>
      </section>
    </MainLayout>
  );
}