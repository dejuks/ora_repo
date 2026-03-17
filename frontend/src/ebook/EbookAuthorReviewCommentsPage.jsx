import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import ebookApi from "../../api/ebook.api";
import StatusBadge from "./components/StatusBadge";

export default function EbookAuthorReviewCommentsPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        setData(await ebookApi.getReviewComments(id));
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load review comments.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <MainLayout>
      <section className="content-header mb-3 d-flex justify-content-between align-items-center flex-wrap">
        <div>
          <h1 className="mb-1">Author Review Comments</h1>
          <p className="text-muted mb-0">Structured reviewer comments prepared for author revision and resubmission.</p>
        </div>
        <div className="d-flex gap-2">
          <Link className="btn btn-outline-secondary mr-2" to="/ebook/my-submissions">My submissions</Link>
          <Link className="btn btn-outline-primary" to={`/ebook/submissions/${id}/edit`}>Update submission</Link>
        </div>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? <div className="card"><div className="card-body">Loading review comments…</div></div> : !data?.submission ? (
        <div className="card"><div className="card-body text-muted">No review data found.</div></div>
      ) : (
        <>
          <div className="card card-primary card-outline mb-4">
            <div className="card-body d-flex justify-content-between align-items-center flex-wrap">
              <div>
                <h4 className="mb-1">{data.submission.title}</h4>
                <div className="text-muted">Decision: {data.submission.final_decision || "Pending"}</div>
                {data.submission.final_decision_note ? <div className="small mt-2">{data.submission.final_decision_note}</div> : null}
              </div>
              <div>
                <StatusBadge value={data.submission.status} />
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-4 mb-3"><div className="small-box bg-info"><div className="inner"><h3>{data.summary?.total_reviews || 0}</h3><p>Total reviews</p></div></div></div>
            <div className="col-md-8 mb-3">
              <div className="card card-light card-outline h-100">
                <div className="card-header"><h3 className="card-title mb-0">Recommendation summary</h3></div>
                <div className="card-body">
                  {!Object.keys(data.summary?.recommendations || {}).length ? <div className="text-muted">No review recommendations yet.</div> : (
                    <div className="d-flex flex-wrap" style={{ gap: 8 }}>
                      {Object.entries(data.summary?.recommendations || {}).map(([key, value]) => (
                        <span className="badge badge-secondary p-2" key={key}>{key}: {value}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card card-secondary card-outline">
            <div className="card-header"><h3 className="card-title mb-0">Reviewer feedback</h3></div>
            <div className="card-body">
              {!data.reviews?.length ? <div className="text-muted">No reviewer comments available yet.</div> : data.reviews.map((review, index) => (
                <div className="border rounded p-3 mb-3" key={review.review_id}>
                  <div className="d-flex justify-content-between align-items-center flex-wrap mb-2">
                    <div className="font-weight-bold">Review #{index + 1}</div>
                    <div className="d-flex align-items-center" style={{ gap: 8 }}>
                      <StatusBadge value={review.assignment_status || "submitted"} />
                      <span className="badge badge-info">{review.recommendation}</span>
                    </div>
                  </div>
                  <div className="text-muted small mb-2">Submitted at: {review.submitted_at ? new Date(review.submitted_at).toLocaleString() : "—"}</div>
                  <div style={{ whiteSpace: "pre-wrap" }}>{review.comments_for_author || "No author-facing comments."}</div>
                </div>
              ))}
            </div>
            <div className="card-footer">
              <Link className="btn btn-primary" to={`/ebook/submissions/${id}/edit`}>Prepare revision</Link>
            </div>
          </div>
        </>
      )}
    </MainLayout>
  );
}
