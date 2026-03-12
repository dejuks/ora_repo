import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../../landing/components/Navbar";
import { publicListPublished } from "../../../api/ebooks";

export default function PublicLibrary() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async (qq) => {
    setLoading(true);
    setErr("");
    try {
      const res = await publicListPublished(qq || undefined);
      setRows(res?.data || []);
    } catch (e) {
      setErr(e?.message || "Failed to load library");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container py-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h3 className="mb-1">ORA eBook Library</h3>
            <div className="text-muted">Browse published eBooks (Open / Restricted / Embargo).</div>
          </div>
        </div>

        <div className="card shadow-sm mb-3">
          <div className="card-body">
            <form
              className="row g-2"
              onSubmit={(e) => {
                e.preventDefault();
                load(q);
              }}
            >
              <div className="col-md-10">
                <input className="form-control" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title / abstract" />
              </div>
              <div className="col-md-2 d-grid">
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>

        {err && <div className="alert alert-danger">{err}</div>}

        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Access</th>
                  <th className="text-end">Open</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4">Loading...</td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-muted">No published eBooks</td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.ebook_id}>
                      <td>
                        <div className="fw-semibold">{r.title}</div>
                        {r.abstract && <small className="text-muted">{String(r.abstract).slice(0, 120)}{String(r.abstract).length > 120 ? "…" : ""}</small>}
                      </td>
                      <td>{r.author_name}</td>
                      <td>
                        <span className={`badge ${r.access_type === "OPEN" ? "bg-success" : r.access_type === "RESTRICTED" ? "bg-warning text-dark" : "bg-info"}`}>
                          {r.access_type || "OPEN"}
                        </span>
                      </td>
                      <td className="text-end">
                        <Link className="btn btn-sm btn-outline-primary" to={`/ebook/library/${r.ebook_id}`}>Details</Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
