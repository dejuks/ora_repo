import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import ebookApi from "../../api/ebook.api";
import StatusBadge from "./components/StatusBadge";

export default function EbookProductionPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({ summary: {}, analytics: {}, production: [] });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await ebookApi.getProductionDashboard();
      setData(result || { summary: {}, analytics: {}, production: [] });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load production queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <MainLayout>
      <section className="content-header mb-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h1 className="mb-1">Digital Production</h1>
            <p className="text-muted mb-0">Validate files, assign ISBN/DOI, confirm proof approval, and publish to the ORA repository.</p>
          </div>
          <button className="btn btn-outline-secondary" onClick={load}>Refresh</button>
        </div>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="row mb-4">
        <div className="col-md-3"><div className="small-box bg-info"><div className="inner"><h3>{data.summary?.total_items || 0}</h3><p>Total items</p></div></div></div>
        <div className="col-md-3"><div className="small-box bg-primary"><div className="inner"><h3>{data.summary?.formatted_count || 0}</h3><p>Formatted</p></div></div></div>
        <div className="col-md-3"><div className="small-box bg-warning"><div className="inner"><h3>{data.summary?.proof_approved_count || 0}</h3><p>Proof approved</p></div></div></div>
        <div className="col-md-3"><div className="small-box bg-success"><div className="inner"><h3>{data.analytics?.total_downloads || 0}</h3><p>Total downloads</p></div></div></div>
      </div>

      <div className="card card-outline card-success">
        <div className="card-header"><h3 className="card-title mb-0">Production queue</h3></div>
        <div className="card-body table-responsive p-0">
          {loading ? <div className="p-3">Loading...</div> : (
            <table className="table table-hover text-nowrap mb-0">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Submission status</th>
                  <th>Formats</th>
                  <th>Proof</th>
                  <th>Publication</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {!data.production?.length ? <tr><td colSpan="7" className="text-center text-muted py-4">No production records yet.</td></tr> : data.production.map((item) => (
                  <tr key={item.production_id}>
                    <td>{item.title}</td>
                    <td>{item.author_name || "—"}</td>
                    <td><StatusBadge status={item.submission_status} /></td>
                    <td>{item.pdf_ready ? "PDF " : ""}{item.epub_ready ? "EPUB" : ""}{!item.pdf_ready && !item.epub_ready ? "Pending" : ""}</td>
                    <td>{item.author_proof_approved ? <span className="badge badge-success">Approved</span> : item.proof_sent_to_author ? <span className="badge badge-warning">Sent</span> : <span className="badge badge-secondary">Not sent</span>}</td>
                    <td>{item.slug ? <span>{item.slug}<br/><small className="text-muted">{item.access_level || "—"}</small></span> : "Not published"}</td>
                    <td><Link className="btn btn-sm btn-outline-primary" to={`/ebook/submissions/${item.submission_id}`}>Open</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
