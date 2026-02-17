import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllGroupsAdminAPI,
  updateGroupStatusAPI, // <-- correct import
} from "../../../api/researcher.group.api";
import MainLayout from "../../../components/layout/MainLayout";

export default function AdminGroups() {
  const [groups, setGroups] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newStatus, setNewStatus] = useState("active");
  const [reason, setReason] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await getAllGroupsAdminAPI();
      setGroups(data);
    } catch (error) {
      console.error("Error loading groups:", error);
    }
  };

  const handleOpenStatusModal = (group) => {
    setSelectedGroup(group);
    setNewStatus(group.status || "active");
    setReason("");
    setShowStatusModal(true);
  };

  const handleChangeStatus = async () => {
    if (!selectedGroup || !newStatus || !reason) {
      alert("Please select a status and provide a reason.");
      return;
    }

    try {
      await updateGroupStatusAPI(selectedGroup.uuid, newStatus, reason);
      alert("Group status updated successfully!");
      setShowStatusModal(false);
      setSelectedGroup(null);
      setReason("");
      loadGroups();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "active":
        return "badge bg-success";
      case "inactive":
        return "badge bg-secondary";
      case "ban":
        return "badge bg-danger";
      default:
        return "badge bg-light";
    }
  };

  return (
    <MainLayout>
      <div className="container mt-4">
        <h3>Admin - All Groups</h3>

        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Name</th>
              <th>Creator</th>
              <th>Members</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.uuid}>
                <td>{g.name}</td>
                <td>{g.creator_name}</td>
                <td>{g.member_count}</td>
                <td>
                  <span className={getStatusBadgeClass(g.status)}>
                    {g.status || "unknown"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-primary me-1"
                    onClick={() => navigate(`/admin/groups/${g.uuid}`)}
                  >
                    View Details
                  </button>
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => handleOpenStatusModal(g)}
                  >
                    Change Status
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showStatusModal && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Change Group Status</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowStatusModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label>Status</label>
                    <select
                      className="form-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="ban">Banned</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label>Reason</label>
                    <textarea
                      className="form-control"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Enter reason for status change"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowStatusModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleChangeStatus}
                  >
                    Save
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
