import { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { getAEAssignedManuscriptsAPI } from "../../../api/associateEditor.api";

export default function Production() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadData = async () => {
    try {
      const res = await getAEAssignedManuscriptsAPI();
      // Only manuscripts with accepted status
      const productionData = (res || []).filter(m => m.status_label === "accepted");
      setData(productionData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredData = data.filter(
    (m) =>
      m.manuscript_title.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter ? m.status_label === statusFilter : true)
  );

  return (
    <MainLayout>
      <div className="container-fluid mt-3">
        {/* FILTER BAR */}
        <div className="row mb-3">
          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="Search title or journal"
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
              <option value="accepted">Accepted</option>
            </select>
          </div>
          <div className="col-md-2">
            <button
              className="btn btn-secondary w-100"
              onClick={() => { setSearch(""); setStatusFilter(""); }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* TABLE */}
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Journal</th>
              <th>Status</th>
              <th>Production Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">
                  No manuscripts in production
                </td>
              </tr>
            ) : (
              filteredData.map((m, i) => (
                <tr key={m.uuid || m.id}>
                  <td>{i + 1}</td>
                  <td>{m.manuscript_title}</td>
                  <td>{m.journal_title}</td>
                  <td>
                    <span className="badge bg-success">{m.status_label}</span>
                  </td>
                  <td>
                    {m.production_notes || "No production notes yet"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}
