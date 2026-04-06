import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { publicationAPI } from "../../api/repository/public.api";

export default function RepositoryItemDetail() {
  const { uuid } = useParams();

  const [item, setItem] = useState(null);
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [rating, setRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [error, setError] = useState("");

  const apiBase =
    process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    let mounted = true;

    const loadItem = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await publicationAPI.getPublicItem(uuid);
        const fetchedItem = res?.item || res;

        if (!mounted) return;

        setItem(fetchedItem || null);

        try {
          await publicationAPI.trackView(uuid);
        } catch (viewErr) {
          console.error("Track view failed:", viewErr);
        }

        try {
          const relatedRes = await publicationAPI.searchPublicItems("", 1, 8);
          const allItems = relatedRes?.items || [];
          const filtered = allItems
            .filter((row) => row.uuid !== uuid)
            .filter((row) =>
              fetchedItem?.item_type
                ? row.item_type === fetchedItem.item_type
                : true
            )
            .slice(0, 4);

          if (mounted) setRelatedItems(filtered);
        } catch (relatedErr) {
          console.error("Related items fetch failed:", relatedErr);
          if (mounted) setRelatedItems([]);
        }
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError(err?.message || "Failed to load repository item.");
        setItem(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (uuid) loadItem();

    return () => {
      mounted = false;
    };
  }, [uuid]);

  const displayYear = useMemo(() => {
    if (!item?.created_at) return "—";
    return new Date(item.created_at).getFullYear();
  }, [item]);

  const getTypeIcon = (type) => {
    const icons = {
      Thesis: "🎓",
      "Journal Article": "📰",
      Article: "📰",
      Book: "📖",
      Books: "📖",
      Dataset: "📊",
      "Policy Paper": "📄",
      "Research Paper": "📄",
      "Research Papers": "📄",
      Collection: "🗂️",
      "Historical Document": "📜",
      "Historical Documents": "📜",
      "Audio Recording": "🎵",
      "Audio Recordings": "🎵",
      Video: "🎥",
      Videos: "🎥",
      Photograph: "🖼️",
      Photographs: "🖼️",
    };

    return icons[type] || "📁";
  };

  const getTypeColor = (type) => {
    const colors = {
      Thesis: "#2563eb",
      "Journal Article": "#0ea5e9",
      Article: "#14b8a6",
      Book: "#f59e0b",
      Books: "#f59e0b",
      Dataset: "#8b5cf6",
      "Policy Paper": "#334155",
      "Research Paper": "#ca8a04",
      "Research Papers": "#ca8a04",
      Collection: "#10b981",
      "Historical Document": "#ea580c",
      "Historical Documents": "#ea580c",
      "Audio Recording": "#16a34a",
      "Audio Recordings": "#16a34a",
      Video: "#dc2626",
      Videos: "#dc2626",
      Photograph: "#7c3aed",
      Photographs: "#7c3aed",
    };

    return colors[type] || "#64748b";
  };

  const formatNumber = (num) => {
    const n = Number(num || 0);
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return `${n}`;
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString();
  };

  const getFileUrl = (path) => {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    if (path.startsWith("/")) {
      return apiBase.replace(/\/api$/, "") + path;
    }
    return apiBase.replace(/\/api$/, "") + "/" + path;
  };

  const handleDownload = async () => {
    if (!item?.uuid) return;

    try {
      setDownloading(true);
      await publicationAPI.trackDownload(item.uuid);

      const fileUrl = getFileUrl(item.file_path);
      if (fileUrl) {
        window.open(fileUrl, "_blank", "noopener,noreferrer");
      } else {
        alert("No downloadable file is available for this item.");
      }

      setItem((prev) =>
        prev
          ? {
              ...prev,
              downloads: Number(prev.downloads || 0) + 1,
            }
          : prev
      );
    } catch (err) {
      console.error(err);
      alert(err?.message || "Failed to process download.");
    } finally {
      setDownloading(false);
    }
  };

  const handleRate = async (value) => {
    if (!item?.uuid || !value) return;

    try {
      setSubmittingRating(true);
      await publicationAPI.rateItem(item.uuid, value);
      setRating(value);
      alert("Thanks for rating this item.");
    } catch (err) {
      console.error(err);
      alert(err?.message || "Failed to submit rating.");
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.page}>
          <div style={styles.centerBox}>
            <div style={styles.loader}></div>
            <p style={styles.loadingText}>Loading repository item...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !item) {
    return (
      <>
        <Navbar />
        <div style={styles.page}>
          <div style={styles.centerBox}>
            <div style={styles.errorIcon}>⚠️</div>
            <h2 style={styles.errorTitle}>Item not available</h2>
            <p style={styles.errorText}>
              {error || "This repository item could not be found."}
            </p>
            <Link to="/repository" style={styles.backButton}>
              Back to Repository
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.page}>
        <section style={styles.hero}>
          <div style={styles.heroInner}>
            <div style={styles.breadcrumbs}>
              <Link to="/" style={styles.breadcrumbLink}>Home</Link>
              <span style={styles.breadcrumbSep}>/</span>
              <Link to="/repository" style={styles.breadcrumbLink}>Repository</Link>
              <span style={styles.breadcrumbSep}>/</span>
              <span style={styles.breadcrumbCurrent}>Item Details</span>
            </div>

            <div style={styles.heroGrid}>
              <div style={styles.mainColumn}>
                <div
                  style={{
                    ...styles.typeBadge,
                    backgroundColor: `${getTypeColor(item.item_type)}18`,
                    color: getTypeColor(item.item_type),
                  }}
                >
                  <span style={styles.typeIcon}>{getTypeIcon(item.item_type)}</span>
                  {item.item_type || "Repository Item"}
                </div>

                <h1 style={styles.title}>{item.title}</h1>

                <p style={styles.abstract}>
                  {item.abstract || "No abstract available for this item."}
                </p>

                <div style={styles.metaChips}>
                  <span style={styles.metaChip}>Year: {displayYear}</span>
                  <span style={styles.metaChip}>
                    Views: {formatNumber(item.views)}
                  </span>
                  <span style={styles.metaChip}>
                    Downloads: {formatNumber(item.downloads)}
                  </span>
                  <span style={styles.metaChip}>
                    Access: {item.access_level || "Open"}
                  </span>
                </div>

                <div style={styles.actionRow}>
                  <button
                    type="button"
                    style={styles.primaryButton}
                    onClick={handleDownload}
                    disabled={downloading}
                  >
                    {downloading ? "Preparing..." : "Download"}
                  </button>

                  <Link to="/repository" style={styles.secondaryButton}>
                    Back to Repository
                  </Link>
                </div>
              </div>

              <div style={styles.sideColumn}>
                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>Item Information</h3>

                  <div style={styles.infoList}>
                    <InfoRow label="UUID" value={item.uuid} />
                    <InfoRow label="Type" value={item.item_type || "—"} />
                    <InfoRow label="Language" value={item.language || "—"} />
                    <InfoRow label="DOI" value={item.doi || "—"} />
                    <InfoRow label="Handle" value={item.handle || "—"} />
                    <InfoRow
                      label="Created"
                      value={formatDate(item.created_at)}
                    />
                    <InfoRow
                      label="Embargo Until"
                      value={formatDate(item.embargo_until)}
                    />
                    <InfoRow
                      label="Access Level"
                      value={item.access_level || "Open"}
                    />
                  </div>
                </div>

                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>Rate this item</h3>
                  <p style={styles.cardText}>
                    Share your feedback about the usefulness of this repository item.
                  </p>

                  <div style={styles.starRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRate(star)}
                        disabled={submittingRating}
                        style={{
                          ...styles.starButton,
                          color: rating >= star ? "#f59e0b" : "#cbd5e1",
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  {rating > 0 && (
                    <div style={styles.ratingNote}>
                      Your rating: {rating}/5
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={styles.contentSection}>
          <div style={styles.contentGrid}>
            <div style={styles.leftPanel}>
              <div style={styles.sectionCard}>
                <h2 style={styles.sectionTitle}>Description</h2>
                <p style={styles.paragraph}>
                  {item.abstract || "No description has been provided for this item."}
                </p>
              </div>

              <div style={styles.sectionCard}>
                <h2 style={styles.sectionTitle}>File Access</h2>
                {item.file_path ? (
                  <div style={styles.fileBox}>
                    <div style={styles.fileIcon}>📄</div>
                    <div style={styles.fileDetails}>
                      <div style={styles.fileLabel}>Attached File</div>
                      <div style={styles.filePath}>{item.file_path}</div>
                    </div>
                    <button
                      type="button"
                      style={styles.fileButton}
                      onClick={handleDownload}
                      disabled={downloading}
                    >
                      Open
                    </button>
                  </div>
                ) : (
                  <div style={styles.emptyBox}>
                    No public file is attached to this item.
                  </div>
                )}
              </div>
            </div>

            <div style={styles.rightPanel}>
              <div style={styles.sectionCard}>
                <h2 style={styles.sectionTitle}>Quick Stats</h2>
                <div style={styles.statGrid}>
                  <div style={styles.statCard}>
                    <div style={styles.statNumber}>{formatNumber(item.views)}</div>
                    <div style={styles.statLabel}>Views</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statNumber}>{formatNumber(item.downloads)}</div>
                    <div style={styles.statLabel}>Downloads</div>
                  </div>
                </div>
              </div>

              <div style={styles.sectionCard}>
                <h2 style={styles.sectionTitle}>Related Items</h2>
                {relatedItems.length > 0 ? (
                  <div style={styles.relatedList}>
                    {relatedItems.map((related) => (
                      <Link
                        key={related.uuid}
                        to={`/repository/item/${related.uuid}`}
                        style={styles.relatedItem}
                      >
                        <div
                          style={{
                            ...styles.relatedIcon,
                            backgroundColor: `${getTypeColor(related.item_type)}18`,
                            color: getTypeColor(related.item_type),
                          }}
                        >
                          {getTypeIcon(related.item_type)}
                        </div>
                        <div style={styles.relatedInfo}>
                          <div style={styles.relatedTitle}>{related.title}</div>
                          <div style={styles.relatedMeta}>
                            {related.item_type || "Repository Item"} •{" "}
                            {related.created_at
                              ? new Date(related.created_at).getFullYear()
                              : "—"}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div style={styles.emptyBox}>No related items found.</div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes repoSpin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }

            @media (max-width: 992px) {
              .repo-hero-grid,
              .repo-content-grid {
                grid-template-columns: 1fr !important;
              }
            }

            @media (max-width: 768px) {
              .repo-title {
                font-size: 34px !important;
              }

              .repo-meta-chips {
                gap: 8px !important;
              }

              .repo-action-row {
                flex-direction: column !important;
                align-items: stretch !important;
              }

              .repo-stats-grid {
                grid-template-columns: 1fr 1fr !important;
              }
            }

            @media (max-width: 576px) {
              .repo-search-card,
              .repo-card,
              .repo-section-card {
                padding: 18px !important;
              }

              .repo-title {
                font-size: 28px !important;
              }

              .repo-stats-grid {
                grid-template-columns: 1fr !important;
              }
            }
          `,
        }}
      />
    </>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={styles.infoValue}>{value}</span>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },

  centerBox: {
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    padding: "24px",
    textAlign: "center",
  },

  loader: {
    width: "44px",
    height: "44px",
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #c9a227",
    borderRadius: "50%",
    animation: "repoSpin 0.9s linear infinite",
  },

  loadingText: {
    color: "#475569",
    fontSize: "16px",
  },

  errorIcon: {
    fontSize: "48px",
  },

  errorTitle: {
    margin: 0,
    fontSize: "28px",
    color: "#0f172a",
  },

  errorText: {
    color: "#64748b",
    maxWidth: "560px",
    lineHeight: 1.7,
  },

  backButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 22px",
    borderRadius: "12px",
    textDecoration: "none",
    fontWeight: 600,
    background: "#0f172a",
    color: "#fff",
  },

  hero: {
    background: "linear-gradient(135deg, #0b2a20 0%, #163c30 55%, #1a5f7a 100%)",
    color: "#fff",
    padding: "48px 20px 56px",
  },

  heroInner: {
    maxWidth: "1200px",
    margin: "0 auto",
  },

  breadcrumbs: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    alignItems: "center",
    marginBottom: "28px",
    fontSize: "14px",
  },

  breadcrumbLink: {
    color: "rgba(255,255,255,0.82)",
    textDecoration: "none",
  },

  breadcrumbSep: {
    color: "rgba(255,255,255,0.4)",
  },

  breadcrumbCurrent: {
    color: "#facc15",
  },

  heroGrid: {
    display: "grid",
    gridTemplateColumns: "1.8fr 1fr",
    gap: "28px",
  },

  mainColumn: {
    minWidth: 0,
    className: "repo-hero-grid",
  },

  sideColumn: {
    minWidth: 0,
  },

  typeBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    borderRadius: "999px",
    fontWeight: 700,
    fontSize: "14px",
    marginBottom: "20px",
    backdropFilter: "blur(8px)",
  },

  typeIcon: {
    fontSize: "18px",
  },
     title: {
    margin: "0 0 16px",
    fontSize: "40px",
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: "-0.5px",
  },

  abstract: {
    fontSize: "16px",
    lineHeight: 1.7,
    color: "rgba(255,255,255,0.85)",
    marginBottom: "20px",
    maxWidth: "800px",
  },

  metaChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "22px",
  },

  metaChip: {
    background: "rgba(255,255,255,0.12)",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 500,
  },

  actionRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center",
  },

  primaryButton: {
    background: "#facc15",
    color: "#0f172a",
    border: "none",
    padding: "12px 20px",
    borderRadius: "10px",
    fontWeight: 700,
    cursor: "pointer",
  },

  secondaryButton: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.4)",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: 600,
  },

  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  },

  cardTitle: {
    margin: "0 0 12px",
    fontSize: "18px",
    fontWeight: 700,
    color: "#0f172a",
  },

  cardText: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "12px",
  },

  infoList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    fontSize: "14px",
  },

  infoLabel: {
    color: "#64748b",
  },

  infoValue: {
    color: "#0f172a",
    fontWeight: 500,
    textAlign: "right",
  },

  starRow: {
    display: "flex",
    gap: "6px",
  },

  starButton: {
    fontSize: "22px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
  },

  ratingNote: {
    marginTop: "10px",
    fontSize: "13px",
    color: "#64748b",
  },

  contentSection: {
    padding: "40px 20px",
  },

  contentGrid: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "24px",
  },

  leftPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  rightPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  sectionCard: {
    background: "#fff",
    borderRadius: "16px",
    padding: "22px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
  },

  sectionTitle: {
    margin: "0 0 12px",
    fontSize: "20px",
    fontWeight: 700,
    color: "#0f172a",
  },

  paragraph: {
    fontSize: "15px",
    lineHeight: 1.7,
    color: "#475569",
  },

  fileBox: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px",
    borderRadius: "12px",
    background: "#f1f5f9",
  },

  fileIcon: {
    fontSize: "28px",
  },

  fileDetails: {
    flex: 1,
  },

  fileLabel: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#0f172a",
  },

  filePath: {
    fontSize: "12px",
    color: "#64748b",
    wordBreak: "break-all",
  },

  fileButton: {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "none",
    background: "#0f172a",
    color: "#fff",
    cursor: "pointer",
  },

  emptyBox: {
    padding: "14px",
    borderRadius: "10px",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: "14px",
  },

  statGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },

  statCard: {
    background: "#f1f5f9",
    borderRadius: "12px",
    padding: "16px",
    textAlign: "center",
  },

  statNumber: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#0f172a",
  },

  statLabel: {
    fontSize: "13px",
    color: "#64748b",
  },

  relatedList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  relatedItem: {
    display: "flex",
    gap: "12px",
    textDecoration: "none",
    padding: "10px",
    borderRadius: "10px",
    background: "#f8fafc",
  },

  relatedIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: 700,
  },

  relatedInfo: {
    flex: 1,
  },

  relatedTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#0f172a",
    marginBottom: "4px",
  },

  relatedMeta: {
    fontSize: "12px",
    color: "#64748b",
  },
};