import { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import {
  getProductionAPI,
  updateProductionAPI
} from "../../../api/manuscript.api";

export default function ProductionScreen() {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {

      const res = await getProductionAPI();

      const manuscripts = Array.isArray(res)
        ? res
        : res?.data || [];

      setData(manuscripts);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateRow = (id, field, value) => {
    setData((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      )
    );
  };

  const handleSave = async (m) => {

    try {

      await updateProductionAPI({
        manuscriptId: m.id,
        productionStatus: m.production_status,
        productionNotes: m.production_notes,
        doi: m.doi,
        publicationDate: m.publication_date
      });

      alert("Production Updated");

    } catch (err) {
      console.error(err);
    }
  };

  const filtered = data.filter((m) => {

    if (
      search &&
      !m.title?.toLowerCase().includes(search.toLowerCase())
    )
      return false;

    if (
      statusFilter &&
      m.production_status !== statusFilter
    )
      return false;

    return true;
  });

  return (
    <MainLayout>
      <div className="container-fluid mt-3">

        {/* FILTER CARD */}
        <div className="card card-info card-outline">

          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-cogs mr-2"></i>
              Production Filters
            </h3>
          </div>

          <div className="card-body">
            <div className="row">

              <div className="col-md-6">
                <input
                  className="form-control"
                  placeholder="Search Title"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="col-md-4">
                <select
                  className="form-control"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option>Copyediting</option>
                  <option>Typesetting</option>
                  <option>Proofreading</option>
                  <option>Ready</option>
                  <option>Published</option>
                </select>
              </div>

              <div className="col-md-2">
                <button
                  className="btn btn-secondary btn-block"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("");
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
            <h3 className="card-title">
              Production Workflow
            </h3>
          </div>

          <div className="card-body table-responsive">

            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="table table-bordered table-hover">

                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Editor</th>
                    <th>Status</th>
                    <th>DOI</th>
                    <th>Publication Date</th>
                    <th>Notes</th>
                    <th>Save</th>
                  </tr>
                </thead>

                <tbody>

                  {filtered.map((m, i) => (

                    <tr key={m.id}>

                      <td>{i + 1}</td>
                      <td>{m.title}</td>
                      <td>{m.assigned_editor_email}</td>

                      <td>
                        <select
                          className="form-control"
                          value={m.production_status || "Copyediting"}
                          onChange={(e) =>
                            updateRow(
                              m.id,
                              "production_status",
                              e.target.value
                            )
                          }
                        >
                          <option>Copyediting</option>
                          <option>Typesetting</option>
                          <option>Proofreading</option>
                          <option>Ready</option>
                          <option>Published</option>
                        </select>
                      </td>

                      <td>
                        <input
                          className="form-control"
                          value={m.doi || ""}
                          onChange={(e) =>
                            updateRow(
                              m.id,
                              "doi",
                              e.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="date"
                          className="form-control"
                          value={
                            m.publication_date
                              ? m.publication_date.split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            updateRow(
                              m.id,
                              "publication_date",
                              e.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <textarea
                          className="form-control"
                          value={m.production_notes || ""}
                          onChange={(e) =>
                            updateRow(
                              m.id,
                              "production_notes",
                              e.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleSave(m)}
                        >
                          Save
                        </button>
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
