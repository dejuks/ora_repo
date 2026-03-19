import { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { getAEAssignedManuscriptsAPI, screeningAPI } from "../../../api/associateEditor.api";
import { Modal, Button } from "react-bootstrap";

export default function InitialScreening() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedID, setSelectedID] = useState(null);

  const [loading, setLoading] = useState(false);

  // Load manuscripts with status 'submitted' or 'screened'
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAEAssignedManuscriptsAPI();
      const filteredRes = (res || []).filter(
        (m) => m.status_label === "submitted" || m.status_label === "screened"
      );
      setData(filteredRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open screening modal
  const openModal = (manuscriptId) => {
    setSelectedID(manuscriptId);
    setModalOpen(true);
  };

  // Confirm screening
  const handleScreening = async () => {
    if (!selectedID) {
      alert("No manuscript selected");
      return;
    }

    try {
      await screeningAPI(selectedID);
      setModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Screening failed");
    }
  };

  // Filtered manuscripts for search and status
  const filtered = data.filter(
    (m) =>
      m.manuscript_title.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter ? m.status_label === statusFilter : true)
  );

  // Badge for status
  const getBadge = (status) => {
    switch (status) {
      case "submitted":
        return "badge bg-secondary";
      case "screened":
        return "badge bg-info";
      default:
        return "badge bg-light text-dark";
    }
  };

  return (
    <MainLayout>
      <div className="container-fluid mt-3">
        {/* FILTER BAR */}
        <div className="row mb-3">
          <div className="col-md-6 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Search title or journal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-4 mb-2">
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="screened">Screened</option>
            </select>
          </div>
          <div className="col-md-2 mb-2">
            <button
              className="btn btn-secondary w-100"
              onClick={() => {
                setSearch("");
                setStatusFilter("");
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* MANUSCRIPTS TABLE */}
        {loading ? (
          <div className="text-center mt-4">
            <i className="fas fa-spinner fa-spin fa-2x"></i>
          </div>
        ) : (
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Journal</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    No manuscripts found
                  </td>
                </tr>
              ) : (
                filtered.map((m, i) => (
                  <tr key={m.uuid || m.id}>
                    <td>{i + 1}</td>
                    <td>{m.manuscript_title}</td>
                    <td>{m.journal_title}</td>
                    <td>
                      <span className={getBadge(m.status_label)}>
                        {m.status_label}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-info btn-sm"
                        disabled={m.status_label !== "submitted"}
                        onClick={() =>
                          openModal(m.uuid || m.id)
                        }
                      >
                        Screening
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* MODAL */}
        <Modal show={modalOpen} onHide={() => setModalOpen(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Screening</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to mark this manuscript as screened?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleScreening}>
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </MainLayout>
  );
}
