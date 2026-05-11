import { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import {
  getAEAssignedManuscriptsAPI,
  recommendAPI,
} from "../../../api/associateEditor.api";
import { Modal, Button } from "react-bootstrap";

export default function Recommendations() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedID, setSelectedID] = useState(null);
  const [recommendDecision, setRecommendDecision] = useState("");
  const [loading, setLoading] = useState(false);

  // Load manuscripts with status 'review'
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAEAssignedManuscriptsAPI();
      const filteredRes = (res || []).filter(
        (m) => m.status_label === "review"
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

  // Open recommendation modal
  const openModal = (manuscriptId) => {
    setSelectedID(manuscriptId);
    setRecommendDecision("");
    setModalOpen(true);
  };

  // Submit recommendation
  const handleRecommend = async () => {
    if (!selectedID) {
      alert("No manuscript selected");
      return;
    }
    if (!recommendDecision) {
      alert("Select a recommendation decision");
      return;
    }

    try {
      await recommendAPI(selectedID, { decision: recommendDecision });
      setModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Recommendation failed");
    }
  };

  // Filtered manuscripts by search and status
  const filtered = data.filter(
    (m) =>
      m.manuscript_title.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter ? m.status_label === statusFilter : true)
  );

  const getBadge = (status) => {
    switch (status) {
      case "review":
        return "badge bg-warning text-dark";
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
              <option value="review">Review</option>
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
                    No manuscripts available for recommendation
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
                        className="btn btn-success btn-sm"
                        onClick={() => openModal(m.uuid || m.id)}
                      >
                        Recommend
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
            <Modal.Title>Make Recommendation</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <select
              className="form-control"
              value={recommendDecision}
              onChange={(e) => setRecommendDecision(e.target.value)}
            >
              <option value="">Select decision</option>
              <option value="accept">Accept</option>
              <option value="minor_revision">Minor Revision</option>
              <option value="major_revision">Major Revision</option>
              <option value="reject">Reject</option>
            </select>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleRecommend}>
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </MainLayout>
  );
}
