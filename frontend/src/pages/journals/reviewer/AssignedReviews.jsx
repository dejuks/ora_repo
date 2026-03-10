import { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import {
  getReviewerAssignedAPI,
  respondInvitationAPI,
  startReviewAPI
} from "../../../api/reviewer.api";
import { Link } from "react-router-dom";

export default function AssignedReviews() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getReviewerAssignedAPI();
      setData(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      alert("Failed to load assignments");
    } finally {
      setLoading(false);
      setProcessingId(null);
    }
  };

  const respond = async (id, status) => {
    try {
      setProcessingId(id);
      await respondInvitationAPI(id, status);
      loadData();
    } catch {
      alert("Failed to update invitation");
    }
  };

  const startReview = async (id) => {
    try {
      setProcessingId(id);
      await startReviewAPI(id);
      loadData();
    } catch {
      alert("Failed to start review");
    }
  };

  const badgeAssignment = (status) => {
    const map = {
      assigned: "badge bg-warning text-dark",
      accepted: "badge bg-info",
      declined: "badge bg-danger",
      completed: "badge bg-success"
    };
    return map[status] || "badge bg-secondary";
  };

  const badgeManuscript = (status) => {
    const map = {
      submitted: "badge bg-secondary",
      screening: "badge bg-warning text-dark",
      under_review: "badge bg-primary",
      revision: "badge bg-info",
      accepted: "badge bg-success",
      under_review: "badge bg-info",
    };
    return map[status] || "badge bg-secondary";
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center p-5">
          <div className="spinner-border text-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-fluid mt-3">
        <div className="card">
          <div className="card-header d-flex justify-content-between">
            <h4 className="mb-0">Assigned Reviews</h4>
            <button className="btn btn-sm btn-primary" onClick={loadData}>
              Refresh
            </button>
          </div>

          <div className="card-body">
            {data.length === 0 ? (
              <div className="alert alert-info">
                No review assignments available
              </div>
            ) : (
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th>Manuscript</th>
                    <th>Deadline</th>
                    <th>Assignment</th>
                    <th>Manuscript Status</th>
                    <th width="260">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <strong>{r.manuscript_title}</strong>
                      </td>

                      <td>
                        {r.due_date
                          ? new Date(r.due_date).toLocaleDateString()
                          : "—"}
                      </td>

                      <td>
                        {r.review_status}
                        
                      </td>

                      <td>
                          {r.manuscript_status}
                      
                      </td>

                      <td>
                        {processingId === r.id ? (
                          <span className="text-muted">Processing...</span>
                        ) : (
                          <>
                            {r.review_status === "assigned" && (
                              <>
                                <button
                                  className="btn btn-success btn-sm me-1"
                                  onClick={() => respond(r.id, "accepted")}
                                >
                                  Accept
                                </button>

                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => respond(r.id, "declined")}
                                >
                                  Decline
                                </button>
                              </>
                            )}

                            {r.review_status === "accepted" && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => startReview(r.id)}
                              >
                                Start Review
                              </button>
                            )}

                            {r.review_status === "completed" && (
                              <span className="text-success">
                                ✔ Review Submitted
                              </span>
                            )}

                            {r.review_status === "accpted" &&
                              r.manuscript_status === "under_review" || r.review_status === "under_review" && (
                                <Link
                                  to={`/reviewer/assigned/${r.id}`}
                                  className="btn btn-outline-primary btn-sm ms-1"
                                >
                                  Open
                                </Link>
                              )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
