import { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import {
  getAEAssignedManuscriptsAPI,
  screeningAPI,
  getReviewersByRoleAPI,
  assignReviewerAPI,
  recommendAPI,
} from "../../../api/associateEditor.api";
import { Modal, Button } from "react-bootstrap";

export default function AssignedManuscripts() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [selectedID, setSelectedID] = useState(null);

  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [recommendDecision, setRecommendDecision] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getAEAssignedManuscriptsAPI();
      setData(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = async (type, manuscriptId) => {
    setActionType(type);
    setSelectedID(manuscriptId);

    if (type === "assign") {
      const reviewersRes = await getReviewersByRoleAPI();
      setReviewers(reviewersRes);
      setSelectedReviewers([]);
    }

    if (type === "recommend") {
      setRecommendDecision("");
    }

    setModalOpen(true);
  };

  const toggleReviewer = (uuid) => {
    setSelectedReviewers((prev) =>
      prev.includes(uuid)
        ? prev.filter((id) => id !== uuid)
        : [...prev, uuid]
    );
  };

  const handleSubmit = async () => {
    if (!selectedID) {
      alert("No manuscript selected");
      return;
    }

    try {
      if (actionType === "screening") {
        await screeningAPI(selectedID);
      }

      if (actionType === "assign") {
        if (!selectedReviewers.length) {
          alert("Select at least one reviewer");
          return;
        }
        await assignReviewerAPI(selectedID, { reviewers: selectedReviewers });
      }

      if (actionType === "recommend") {
        if (!recommendDecision) {
          alert("Select a decision");
          return;
        }
        await recommendAPI(selectedID, { decision: recommendDecision });
      }

      setModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Action failed");
    }
  };

  const filtered = data.filter(
    (m) =>
      m.manuscript_title.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter ? m.status_label === statusFilter : true)
  );

  // Enable buttons
  const isScreeningEnabled = (status) => status === "Submitted" || status === "screened";
  const isAssignEnabled = (status) => status === "Submitted" || status === "screened";
  const isRecommendEnabled = (status) => status === "Submitted" || status === "review";

  return (
    <MainLayout>
      <div className="container-fluid mt-3">
        {/* FILTER BAR */}
        <div className="row mb-3">
          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="Search title or journal..."
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
              <option value="submitted">Submitted</option>
              <option value="screened">Screened</option>
              <option value="review">Review</option>
              <option value="decision">Decision</option>
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

        {/* MANUSCRIPTS TABLE */}
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Journal</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => (
              <tr key={m.id || m.uuid}>
                <td>{i + 1}</td>
                <td>{m.manuscript_title}</td>
                <td>{m.journal_title}</td>
                <td>{m.status_label}</td>
                <td>
                  <button
                    className="btn btn-info btn-sm me-1"
                    disabled={!isScreeningEnabled(m.status_label)}
                    onClick={() => openModal("screening", m.uuid || m.id)}
                  >
                    Screening
                  </button>

                  <button
                    className="btn btn-warning btn-sm me-1"
                    disabled={!isAssignEnabled(m.status_label)}
                    onClick={() => openModal("assign", m.uuid || m.id)}
                  >
                    Assign Reviewer
                  </button>

                  <button
                    className="btn btn-success btn-sm"
                    disabled={!isRecommendEnabled(m.status_label)}
                    onClick={() => openModal("recommend", m.uuid || m.id)}
                  >
                    Recommend
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* MODAL */}
        <Modal show={modalOpen} onHide={() => setModalOpen(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{actionType.toUpperCase()}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {actionType === "assign" &&
              reviewers.map((r) => (
                <div key={r.uuid} className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`rev-${r.uuid}`}
                    checked={selectedReviewers.includes(r.uuid)}
                    onChange={() => toggleReviewer(r.uuid)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`rev-${r.uuid}`}
                  >
                    {r.full_name} ({r.email})
                  </label>
                </div>
              ))}

            {actionType === "recommend" && (
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
            )}

            {actionType === "screening" && <p>Confirm screening?</p>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </MainLayout>
  );
}
