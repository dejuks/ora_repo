import { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import {
  getFinalDecisionsAPI,
  makeFinalDecisionAPI,
  getDecisionsAPI,
} from "../../../api/manuscript.api";

export default function FinalDecisions() {
  const [data, setData] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [journalFilter, setJournalFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get manuscripts ready for final decision
        const manuscripts = await getFinalDecisionsAPI();
        setData(manuscripts);

        // Get decisions from decisions table
        const decisionList = await getDecisionsAPI();
        setDecisions(decisionList); // decisionList should be array of {id, name}
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDecision = async (manuscriptId, decisionId) => {
    if (!decisionId) return;

    try {
      const res = await makeFinalDecisionAPI(manuscriptId, decisionId);
      alert(res.message);

      // Update table data
      setData((prev) =>
        prev.map((m) =>
          m.id === manuscriptId
            ? {
                ...m,
                status_label: res.manuscript.status_label,
                final_decision: res.manuscript.final_decision,
              }
            : m
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to save decision");
    }
  };

  const filteredData = data.filter((m) => {
    const title = (m.manuscript_title ?? "").toLowerCase();
    const journal = (m.journal_title ?? "").toLowerCase();
    const section = (m.section_name ?? "").toLowerCase();
    const searchTerm = search.toLowerCase();

    return (
      (title.includes(searchTerm) || journal.includes(searchTerm)) &&
      (statusFilter ? m.status_label === statusFilter : true) &&
      (journalFilter ? m.journal_title === journalFilter : true) &&
      (sectionFilter ? m.section_name === sectionFilter : true)
    );
  });

  const uniqueJournals = [...new Set(data.map((m) => m.journal_title).filter(Boolean))];
  const uniqueSections = [...new Set(data.map((m) => m.section_name).filter(Boolean))];
  const uniqueStatuses = [...new Set(data.map((m) => m.status_label).filter(Boolean))];

  return (
    <MainLayout>
      <div className="container-fluid mt-3">

        {/* Filters */}
        <div className="card card-outline card-info mb-3">
          <div className="card-header">
            <h3 className="card-title"><i className="fas fa-filter mr-2"></i>Filters</h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-3 mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search Title or Journal"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="col-md-3 mb-2">
                <select
                  className="form-control"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  {uniqueStatuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3 mb-2">
                <select
                  className="form-control"
                  value={journalFilter}
                  onChange={(e) => setJournalFilter(e.target.value)}
                >
                  <option value="">All Journals</option>
                  {uniqueJournals.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3 mb-2">
                <select
                  className="form-control"
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                >
                  <option value="">All Sections</option>
                  {uniqueSections.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-2">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
                  setJournalFilter("");
                  setSectionFilter("");
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card card-success card-outline">
          <div className="card-header">
            <h3 className="card-title">Final Decisions</h3>
          </div>
          <div className="card-body table-responsive p-0" style={{ maxHeight: 500 }}>
            {loading ? (
              <p className="text-center mt-2">Loading...</p>
            ) : (
              <table className="table table-hover table-striped table-bordered text-nowrap mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Journal</th>
                    <th>Section</th>
                    <th>Status</th>
                    <th>Final Decision</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center">No manuscripts found</td>
                    </tr>
                  ) : (
                    filteredData.map((m, i) => {
                      const decisionMade = !!m.final_decision;
                      return (
                        <tr key={m.id}>
                          <td>{i + 1}</td>
                          <td>{m.manuscript_title ?? "-"}</td>
                          <td>{m.journal_title ?? "-"}</td>
                          <td>{m.section_name ?? "-"}</td>
                          <td>{m.status_label ?? "-"}</td>
                          <td>{m.final_decision ?? "Pending"}</td>
                          <td>
                            <select
                              className="form-control form-control-sm"
                              disabled={decisionMade}
                              onChange={(e) => handleDecision(m.id, e.target.value)}
                            >
                              <option value="">--Select Decision--</option>
                              {decisions.map((d) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })
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
