import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import ebookApi from "../../api/ebook.api";
import StatusBadge from "./components/StatusBadge";

export default function EbookAuthorProofApprovalPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [data, setData] = useState(null);
  const [note, setNote] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setData(await ebookApi.getWorkflow(id));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load proof details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const proofFile = useMemo(() => {
    const files = data?.files || [];
    return files.find((item) => item.file_role === "proof") || files.find((item) => item.file_role === "pdf") || null;
  }, [data]);

  const approve = async () => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await ebookApi.approveProof(id, { note });
      setNotice("Final proof approved successfully.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to approve proof.");
    } finally {
      setSaving(false);
    }
  };

  const sub = data?.submission || {};

  return (
    <MainLayout>
      <section className="content-header mb-3 d-flex justify-content-between align-items-center flex-wrap">
        <div>
          <h1 className="mb-1">Author Proof Approval</h1>
          <p className="text-muted mb-0">Approve the final proof after checking layout, content, and formatting.</p>
        </div>
        <div className="d-flex gap-2">
          <Link className="btn btn-outline-secondary mr-2" to="/ebook/my-submissions">My submissions</Link>
          <Link className="btn btn-outline-secondary" to={`/ebook/submissions/${id}`}>Open submission</Link>
        </div>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {notice ? <div className="alert alert-success">{notice}</div> : null}

      {loading ? <div className="card"><div className="card-body">Loading proof status…</div></div> : (
        <div className="row">
          <div className="col-lg-5 mb-4">
            <div className="card card-primary card-outline h-100">
              <div className="card-header"><h3 className="card-title mb-0">Proof status</h3></div>
              <div className="card-body">
                <h5>{sub.title}</h5>
                <p className="mb-2"><strong>Workflow:</strong> <StatusBadge value={sub.status} /></p>
                <p className="mb-2"><strong>Proof sent to author:</strong> {sub.proof_sent_to_author ? "Yes" : "No"}</p>
                <p className="mb-2"><strong>Author approved:</strong> {sub.author_proof_approved ? "Yes" : "No"}</p>
                <p className="mb-0"><strong>ISBN / DOI:</strong> {sub.isbn || "—"} / {sub.doi || "—"}</p>
              </div>
            </div>
          </div>
          <div className="col-lg-7">
            <div className="card card-success card-outline">
              <div className="card-header"><h3 className="card-title mb-0">Final author confirmation</h3></div>
              <div className="card-body">
                <p className="mb-3">Review the proof file and confirm that the manuscript is ready for publication.</p>
                {proofFile ? (
                  <div className="alert alert-light border">
                    <div className="font-weight-bold">Proof file detected</div>
                    <div>{proofFile.original_name}</div>
                    <small className="text-muted">Role: {proofFile.file_role}</small>
                  </div>
                ) : (
                  <div className="alert alert-warning">No proof file is attached yet. Ask the digital content manager to upload the proof first.</div>
                )}
                <div className="form-group mb-0">
                  <label>Approval note</label>
                  <textarea className="form-control" rows="4" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Example: I reviewed the final proof and approve it for publication." />
                </div>
              </div>
              <div className="card-footer">
                <button className="btn btn-success" disabled={saving || !sub.proof_sent_to_author || sub.author_proof_approved} onClick={approve}>
                  {saving ? "Approving…" : sub.author_proof_approved ? "Already approved" : "Approve final proof"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
