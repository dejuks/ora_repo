import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../../../../components/layout/MainLayout";
import { useNavigate } from "react-router-dom";
const API = process.env.REACT_APP_API_URL;

function EbookReviewerPendingPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [responseNote, setResponseNote] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);

  const BASE = `${API}/oraebook/reviewer/pending`;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return (window.location.href = "/login");
    loadData(token);
  }, []);
const navigate = useNavigate();
  const loadData = async (token) => {
    try {
      setLoading(true);
      const res = await axios.get(BASE, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search, status },
      });
      setRows(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const token = localStorage.getItem("token");
    loadData(token);
  };

  // ✅ ACCEPT / DECLINE
  const handleRespond = async (assignmentId, action) => {
    const token = localStorage.getItem("token");

    try {
      setActionLoadingId(assignmentId);

      await axios.post(
        `${BASE}/${assignmentId}/respond`,
        {
          action,
          response_note: responseNote[assignmentId] || "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRows((prev) =>
        prev.map((item) =>
          item.assignment_id === assignmentId
            ? { ...item, status: action }
            : item
        )
      );

      setSelectedItem(null);
    } catch (err) {
      console.error(err);
      alert("Failed to respond");
    } finally {
      setActionLoadingId("");
    }
  };

  // ✅ START REVIEW
const startReview = async (assignmentId) => {
  const token = localStorage.getItem("token");

  try {
    setActionLoadingId(assignmentId);

    // ✅ update backend status first
    await axios.post(
      `${API}/oraebook/reviewer/${assignmentId}/start`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // ✅ redirect to review page
    navigate(`/reviewer/review/${assignmentId}`);

  } catch (err) {
    console.error(err);
    alert("Failed to start review");
  } finally {
    setActionLoadingId("");
  }
};

  // ✅ SUBMIT REVIEW
  const submitReview = async (assignmentId) => {
    const token = localStorage.getItem("token");

    try {
      setActionLoadingId(assignmentId);

      await axios.post(
        `${API}/oraebook/reviewer/${assignmentId}/submit`,
        {
          recommendation: "accept", // 🔥 you can replace with select input
          comments_for_author: responseNote[assignmentId] || "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRows((prev) =>
        prev.map((item) =>
          item.assignment_id === assignmentId
            ? { ...item, status: "completed" }
            : item
        )
      );

      setSelectedItem(null);
    } catch (err) {
      console.error(err);
      alert("Failed to submit review");
    } finally {
      setActionLoadingId("");
    }
  };

  const setNote = (id, value) => {
    setResponseNote((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <MainLayout>
      <div className="container-fluid mt-4">

        {/* SEARCH */}
        <div className="card p-3 mb-3">
          <div className="row">
            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <select
                className="form-control"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All</option>
                <option value="assigned">Assigned</option>
                <option value="accepted">Accepted</option>
                <option value="in_review">In Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="col-md-2">
              <button className="btn btn-primary" onClick={handleSearch}>
                Search
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="card">
          <div className="card-body">

            {loading ? (
              <div>Loading...</div>
            ) : (
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((item, index) => (
                    <tr key={item.assignment_id}>
                      <td>{index + 1}</td>
                      <td>{item.title}</td>
                      <td>{item.status}</td>
                      <td>
                        {item.due_date
                          ? new Date(item.due_date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() => setSelectedItem(item)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            )}
          </div>
        </div>

        {/* MODAL */}
        {selectedItem && (
          <div className="modal d-block" style={{ background: "#00000088" }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content p-3">

                <h4>{selectedItem.title}</h4>

                <p><b>Author:</b> {selectedItem.author_name || "-"}</p>
                <p><b>Category:</b> {selectedItem.category || "-"}</p>
                <p><b>Language:</b> {selectedItem.language}</p>

                <hr />

                <p>{selectedItem.abstract}</p>

                <textarea
                  className="form-control"
                  placeholder="Note..."
                  value={responseNote[selectedItem.assignment_id] || ""}
                  onChange={(e) =>
                    setNote(selectedItem.assignment_id, e.target.value)
                  }
                />

                <div className="mt-3">

                  {/* ASSIGNED */}
                  {selectedItem.status === "assigned" && (
                    <>
                      <button
                        className="btn btn-success mr-2"
                        onClick={() =>
                          handleRespond(selectedItem.assignment_id, "accepted")
                        }
                      >
                        Accept
                      </button>

                      <button
                        className="btn btn-danger"
                        onClick={() =>
                          handleRespond(selectedItem.assignment_id, "declined")
                        }
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {/* ACCEPTED */}
                  {selectedItem.status === "accepted" && (
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        startReview(selectedItem.assignment_id)
                      }
                    >
                      Start Review
                    </button>
                  )}

                  {/* IN REVIEW */}
                  {selectedItem.status === "in_review" && (
                    <button
                      className="btn btn-success"
                      onClick={() =>
                        submitReview(selectedItem.assignment_id)
                      }
                    >
                      Submit Review
                    </button>
                  )}

                  <button
                    className="btn btn-secondary ml-2"
                    onClick={() => setSelectedItem(null)}
                  >
                    Close
                  </button>

                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}

export default EbookReviewerPendingPage;