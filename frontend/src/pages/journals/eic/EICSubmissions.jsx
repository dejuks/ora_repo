import { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import {
  getEICSubmissions,
  passEICScreening,
  failEICScreening,
} from "../../../api/manuscript.api";

export default function EICSubmissions() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // =========================
  // LOAD DATA
  // =========================
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getEICSubmissions();
      const manuscripts = Array.isArray(res) ? res : res.data || [];
      setData(manuscripts);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================
  // FILTER
  // =========================
  const filteredData = data.filter(
    (m) =>
      m.title?.toLowerCase().includes(search.toLowerCase()) ||
      m.journal_title?.toLowerCase().includes(search.toLowerCase())
  );

  // =========================
  // ACTIONS
  // =========================
  const handlePass = async (id) => {
    if (!window.confirm("Pass this manuscript to the next stage?")) return;
    try {
      await passEICScreening(id);
      loadData();
    } catch (err) {
      alert("Failed to pass screening");
    }
  };

  const handleFail = async (id) => {
    if (!window.confirm("Fail this manuscript at screening stage?")) return;
    try {
      await failEICScreening(id);
      loadData();
    } catch (err) {
      alert("Failed to fail screening");
    }
  };

  const handleAssignEditor = (id) => {
    window.location.href = `/eic/assign-editor/${id}`;
  };

  const handleView = (id) => {
    window.location.href = `/eic/manuscripts/${id}`;
  };

  // =========================
  // UI
  // =========================
  return (
    <MainLayout>
      <div className="container-fluid mt-3">
        <div className="card card-primary card-outline">
          <div className="card-header">
            <h3 className="card-title">EIC First Screening</h3>

            <div className="card-tools">
              <input
                type="text"
                className="form-control form-control-sm"
                style={{ width: 200 }}
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div
            className="card-body table-responsive p-0"
            style={{ maxHeight: 500 }}
          >
            {loading ? (
              <p className="text-center mt-3">Loading...</p>
            ) : (
              <table className="table table-hover table-striped table-bordered text-nowrap mb-0">
                <thead className="thead-light">
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Journal</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No manuscripts found
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((m, i) => (
                      <tr key={m.id}>
                        <td>{i + 1}</td>
                        <td>{m.title}</td>
                        <td>{m.journal_title}</td>

                        <td>
                          <span className="badge badge-info">
                            {m.status_label}
                          </span>
                        </td>

                        

                        <td>
                          {new Date(m.created_at).toLocaleDateString()}
                        </td>

                        <td>
                          {/* View */}
                          <button
                            className="btn btn-sm btn-info mr-1"
                            onClick={() => handleView(m.id)}
                            title="View Manuscript"
                          >
                            <i className="fas fa-eye"></i>
                          </button>

                          {/* Screening */}
                          {m.screening_status === "pending" && (
                            <>
                              <button
                                className="btn btn-sm btn-success mr-1"
                                onClick={() => handlePass(m.id)}
                                title="Pass Screening"
                              >
                                <i className="fas fa-check"></i>
                              </button>

                              <button
                                className="btn btn-sm btn-danger mr-1"
                                onClick={() => handleFail(m.id)}
                                title="Fail Screening"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </>
                          )}

                          {/* Assign Editor */}
                          {m.screening_status === "passed" && (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleAssignEditor(m.id)}
                              title="Assign Editor"
                            >
                              <i className="fas fa-user-check"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
