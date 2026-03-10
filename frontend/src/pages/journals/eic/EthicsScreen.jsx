import { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import {
  getEthicsManuscriptsAPI,
  updateEthicsAPI
} from "../../../api/odl_manuscript.api";

export default function EthicsScreen() {

  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editorFilter, setEditorFilter] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, statusFilter, editorFilter, data]);

  /* ================= LOAD DATA ================= */
  const loadData = async () => {
    try {
      const res = await getEthicsManuscriptsAPI();

      // VERY IMPORTANT FIX
      const manuscripts = Array.isArray(res)
        ? res
        : res?.data || [];

      setData(manuscripts);
      setFiltered(manuscripts);

    } catch (err) {
      console.error("Load ethics failed:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */
  const applyFilters = () => {
    let result = [...data];

    if (search) {
      result = result.filter(
        (m) =>
          m.title?.toLowerCase().includes(search.toLowerCase()) ||
          m.author_email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter) {
      result = result.filter(
        (m) => m.ethics_status === statusFilter
      );
    }

    if (editorFilter) {
      result = result.filter(
        (m) => m.assigned_editor_email === editorFilter
      );
    }

    setFiltered(result);
  };

  /* ================= UPDATE LOCAL STATE ================= */
  const updateRow = (id, field, value) => {
    setFiltered((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      )
    );
  };

  /* ================= SAVE ================= */
  const handleUpdate = async (m) => {
    try {

      await updateEthicsAPI({
        manuscriptId: m.id,
        ethicsStatus: m.ethics_status,
        ethicsNotes: m.ethics_notes,
        userId: localStorage.getItem("uuid")
      });

      alert("Ethics Updated");

    } catch (err) {
      console.error("Update ethics failed:", err);
    }
  };

  const uniqueEditors = [
    ...new Set(
      data.map((m) => m.assigned_editor_email).filter(Boolean)
    )
  ];

  return (
    <MainLayout>
      <div className="container-fluid mt-3">

        {/* FILTER CARD */}
        <div className="card card-outline card-info">

          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-filter mr-2"></i>
              Ethics Filters
            </h3>
          </div>

          <div className="card-body">
            <div className="row">

              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search Title or Author"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="col-md-3">
                <select
                  className="form-control"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <div className="col-md-3">
                <select
                  className="form-control"
                  value={editorFilter}
                  onChange={(e) => setEditorFilter(e.target.value)}
                >
                  <option value="">All Editors</option>
                  {uniqueEditors.map((ed) => (
                    <option key={ed} value={ed}>
                      {ed}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-2">
                <button
                  className="btn btn-secondary btn-block"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("");
                    setEditorFilter("");
                  }}
                >
                  Reset
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="card card-primary card-outline">

          <div className="card-header">
            <h3 className="card-title">Ethics Screening</h3>
          </div>

          <div className="card-body table-responsive">

            {loading ? (
              <p className="text-center">Loading...</p>
            ) : (
              <table className="table table-bordered table-hover">

                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Editor</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th>Save</th>
                  </tr>
                </thead>

                <tbody>

                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No manuscripts found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((m, i) => (

                      <tr key={m.id}>

                        <td>{i + 1}</td>
                        <td>{m.title}</td>
                        <td>{m.author_email}</td>
                        <td>{m.assigned_editor_email || "-"}</td>

                        <td>
                          <select
                            className="form-control"
                            value={m.ethics_status || "Pending"}
                            onChange={(e) =>
                              updateRow(
                                m.id,
                                "ethics_status",
                                e.target.value
                              )
                            }
                          >
                            <option>Pending</option>
                            <option>Passed</option>
                            <option>Failed</option>
                          </select>
                        </td>

                        <td>
                          <textarea
                            className="form-control"
                            value={m.ethics_notes || ""}
                            onChange={(e) =>
                              updateRow(
                                m.id,
                                "ethics_notes",
                                e.target.value
                              )
                            }
                          />
                        </td>

                        <td>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleUpdate(m)}
                          >
                            Save
                          </button>
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
