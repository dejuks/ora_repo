import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../../../../components/layout/MainLayout";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;

function EbookReviewerPendingPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const BASE = `${API}/oraebook/reviewer/pending`;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    loadData(token);
  }, []);

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

  const startReview = async (assignmentId) => {
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `${API}/oraebook/reviewer/${assignmentId}/start`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      navigate(`/reviewer/review/${assignmentId}`);

    } catch (err) {
      console.error(err);
      alert("Failed to start review");
    }
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
                          className="btn btn-sm btn-info me-2"
                          onClick={() =>
                            navigate(`/ebook/reviewer/review/${item.assignment_id}`)
                          }
                        >
                          View
                        </button>

                        {item.status === "accepted" && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => startReview(item.assignment_id)}
                          >
                            Start
                          </button>
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

export default EbookReviewerPendingPage;