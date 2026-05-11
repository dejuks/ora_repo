import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import ebookApi from "../../api/ebookApi.js";
import StatusBadge from "./components/StatusBadge.jsx";

export default function EbookPublicPublicationDetailPage() {
  const { id } = useParams(); // ✅ FIXED: use id not slug

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [publication, setPublication] = useState(null);
  const [citation, setCitation] = useState(null);

  const load = async () => {
    if (!id) {
      setError("Invalid publication ID");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [pub, cite] = await Promise.all([
        ebookApi.getPublicPublication(id),
        ebookApi.getPublicCitation(id),
      ]);

      setPublication(pub);
      setCitation(cite);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load publication details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleDownload = async () => {
    setDownloading(true);
    setError('');
    setNotice('');

    try {
      const res = await ebookApi.downloadPublicPublication(id);

      const blob = new Blob([res.data], {
        type: res.headers['content-type'] || 'application/octet-stream'
      });

      const href = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      const contentDisposition = res.headers['content-disposition'] || '';
      const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);

      a.href = href;
      a.download = fileNameMatch?.[1] || `${id}.pdf`;

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(href);

      setNotice('Download started successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Download failed.');
    } finally {
      setDownloading(false);
    }
  };

  const copyCitation = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      setNotice('Citation copied to clipboard.');
    } catch {
      setNotice('Could not copy automatically.');
    }
  };

  return (
    <MainLayout>
      <section className="content-header mb-3 d-flex justify-content-between align-items-center flex-wrap">
        <div>
          <h1 className="mb-1">Public eBook Detail</h1>
          <p className="text-muted mb-0">
            Read publication metadata, download where allowed, and copy citation formats.
          </p>
        </div>

        <Link className="btn btn-outline-secondary" to="/ebook/publications">
          Back to catalog
        </Link>
      </section>

      {error && <div className="alert alert-danger">{error}</div>}
      {notice && <div className="alert alert-success">{notice}</div>}

      {loading ? (
        <div className="card">
          <div className="card-body">Loading publication…</div>
        </div>
      ) : publication ? (
        <div className="row">
          <div className="col-lg-8 mb-4">
            <div className="card card-primary card-outline">
              <div className="card-header">
                <h3 className="card-title mb-0">Publication information</h3>
              </div>

              <div className="card-body">
                <h3 className="mb-1">{publication.title}</h3>

                {publication.subtitle && (
                  <p className="text-muted mb-3">{publication.subtitle}</p>
                )}

                <p><strong>Author:</strong> {publication.author_name || '—'}</p>
                <p><strong>Access level:</strong> <StatusBadge value={publication.access_level} /></p>
                <p><strong>Year:</strong> {publication.publication_year || '—'}</p>
                <p><strong>ISBN:</strong> {publication.isbn || '—'}</p>
                <p><strong>DOI:</strong> {publication.doi || '—'}</p>

                <p>
                  <strong>Views / Downloads:</strong>{" "}
                  {publication.view_count || 0} / {publication.download_count || 0}
                </p>

                <p className="mb-3">
                  <strong>Keywords:</strong>{" "}
                  {publication.keywords?.length ? publication.keywords.join(", ") : "—"}
                </p>

                <div className="p-3 bg-light rounded border mb-3">
                  <strong>Access message:</strong>
                  <div>{publication.access_message || "—"}</div>
                </div>

                <p style={{ whiteSpace: "pre-wrap" }}>
                  {publication.abstract || "No abstract available."}
                </p>
              </div>
            </div>
          </div>

          <div className="col-lg-4 mb-4">
            <div className="card card-secondary card-outline mb-3">
              <div className="card-header">
                <h3 className="card-title mb-0">Reader actions</h3>
              </div>

              <div className="card-body">
                <button
                  className="btn btn-primary btn-block mb-2"
                  onClick={handleDownload}
                  disabled={!publication.can_download || downloading}
                >
                  {downloading ? "Downloading…" : "Download publication"}
                </button>

                {!publication.can_download && (
                  <div className="alert alert-warning mb-0">
                    Download is not available for this publication.
                  </div>
                )}
              </div>
            </div>

            <div className="card card-secondary card-outline">
              <div className="card-header">
                <h3 className="card-title mb-0">Citation export</h3>
              </div>

              <div className="card-body">
                {citation ? (
                  <>
                    <div className="mb-3">
                      <label>APA</label>
                      <textarea className="form-control" rows="3" readOnly value={citation.apa || ''} />
                      <button
                        className="btn btn-sm btn-outline-primary mt-2"
                        onClick={() => copyCitation(citation.apa || '')}
                      >
                        Copy APA
                      </button>
                    </div>

                    <div className="mb-3">
                      <label>MLA</label>
                      <textarea className="form-control" rows="3" readOnly value={citation.mla || ''} />
                      <button
                        className="btn btn-sm btn-outline-primary mt-2"
                        onClick={() => copyCitation(citation.mla || '')}
                      >
                        Copy MLA
                      </button>
                    </div>

                    <div>
                      <label>BibTeX</label>
                      <textarea className="form-control" rows="7" readOnly value={citation.bibtex || ''} />
                    </div>
                  </>
                ) : (
                  <div className="text-muted">Citation data unavailable.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </MainLayout>
  );
}