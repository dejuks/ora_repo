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

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await getReviewerAssignedAPI();
      setData(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (id, status) => {
    await respondInvitationAPI(id, status);
    loadData();
  };

  const handleStartReview = async (id) => {
    await startReviewAPI(id);
    loadData();
  };

  const badge = (status) => {
    switch (status) {
      case "pending": return "badge bg-warning";
      case "accepted": return "badge bg-info";
      case "in_review": return "badge bg-primary";
      case "submitted": return "badge bg-success";
      case "declined": return "badge bg-danger";
      default: return "badge bg-secondary";
    }
  };

  return (
    <MainLayout>
      <div className="container-fluid mt-3">

        <div className="card">
          <div className="card-header">
            <h4><i className="fas fa-inbox mr-2"></i> Assigned Reviews</h4>
          </div>

          <div className="card-body">

            {loading ? (
              <div className="text-center">
                <i className="fas fa-spinner fa-spin fa-2x"></i>
              </div>
            ) : data.length === 0 ? (
              <div className="alert alert-info">
                No assigned reviews
              </div>
            ) : (

              <div className="table-responsive">
                <table className="table table-bordered table-hover">

                  <thead className="thead-light">
                    <tr>
                      <th>Manuscript</th>
                      <th>Journal</th>
                      <th>Deadline</th>
                      <th>Status</th>
                      <th width="260">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.map((r) => (
                      <tr key={r.id}>
                        <td>{r.manuscript_title}</td>
                        <td>{r.journal_title}</td>
                        <td>{new Date(r.deadline).toLocaleDateString()}</td>
                        <td>
                          <span className={badge(r.status)}>
                            {r.status}
                          </span>
                        </td>

                        <td>

                          {r.status === "pending" && (
                            <>
                              <button
                                className="btn btn-success btn-sm mr-1"
                                onClick={() => handleResponse(r.id, "accepted")}
                              >
                                Accept
                              </button>

                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleResponse(r.id, "declined")}
                              >
                                Decline
                              </button>
                            </>
                          )}

                          {r.status === "accepted" && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleStartReview(r.id)}
                            >
                              Start Review
                            </button>
                          )}
{r.status === "in_review" && (
  <Link
    to={`/reviewer/assigned/${r.id}`}
    className="btn btn-primary btn-sm"
  >
    View Details
  </Link>
)}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>

            )}

          </div>
        </div>

      </div>
    </MainLayout>
  );
}
