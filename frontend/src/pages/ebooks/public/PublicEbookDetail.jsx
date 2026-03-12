import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../../../landing/components/Navbar";
import { publicEbookDetail, publicDownloadEbook } from "../../../api/ebooks";

export default function PublicEbookDetail() {
  const { id } = useParams();
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [downloading, setDownloading] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await publicEbookDetail(id);
      setRow(res?.data || null);
    } catch (e) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const download = async (type) => {
    setDownloading(true);
    try {
      const res = await publicDownloadEbook(id, type);
      const url = res?.data?.url;
      if (!url) throw new Error("No download URL");
      window.open(url, "_blank");
    } catch (e) {
      alert(e?.message || "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container py-4">
        <div className="mb-3">
          <Link to="/ebook/library" className="btn btn-sm btn-outline-secondary">
            ← Back
          </Link>
        </div>

        {err && <div className="alert alert-danger">{err}</div>}

        <div className="card shadow-sm">
          <div className="card-body">
            {loading ? (
              <div>Loading...</div>
            ) : !row ? (
              <div className="text-muted">Not found</div>
            ) : (
              <>
                <h3 className="mb-1">{row.title}</h3>
                <div className="text-muted mb-3">Author: {row.author_name}</div>

                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="text-muted">Access</div>
                    <div className="fw-semibold">{row.access_type || "OPEN"}</div>
                    {row.embargo_until && <small className="text-muted">Embargo until: {String(row.embargo_until).slice(0, 10)}</small>}
                  </div>
                  <div className="col-md-4">
                    <div className="text-muted">ISBN</div>
                    <div className="fw-semibold">{row.isbn || "—"}</div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-muted">DOI</div>
                    <div className="fw-semibold">{row.doi || "—"}</div>
                  </div>
                </div>

                <hr />

                <div>
                  <div className="text-muted mb-1">Abstract</div>
                  <div style={{ whiteSpace: "pre-wrap" }}>{row.abstract || "—"}</div>
                </div>

                <hr />

                <div className="d-flex gap-2">
                  <button className="btn btn-primary" onClick={() => download("pdf")} disabled={downloading}>
                    Download PDF
                  </button>
                  <button className="btn btn-outline-primary" onClick={() => download("epub")} disabled={downloading}>
                    Download EPUB
                  </button>
                </div>

                <div className="text-muted mt-3" style={{ fontSize: 12 }}>
                  If the eBook is Restricted, you must be logged in (token in localStorage) before download.
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
