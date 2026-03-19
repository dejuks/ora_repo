import React, { useEffect, useState } from "react";
import {
  getGroupMembersAPI,
  updateMemberRoleAPI,
  removeMemberAPI
} from "../../../api/researcher.group.api";

export default function GroupMembers({ groupId, isOwner, onMemberRemoved }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, [groupId]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const response = await getGroupMembersAPI(groupId);
      console.log("Members loaded:", response.data); // Debug log
      setMembers(response.data || []);
    } catch (error) {
      console.error("Error loading members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateMemberRoleAPI(groupId, userId, newRole);
      await loadMembers();
      alert(`Member role updated to ${newRole}`);
    } catch (error) {
      console.error("Error updating role:", error);
      alert(error.response?.data?.message || "Failed to update role");
    }
  };

  const handleRemoveMember = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to remove ${userName} from the group?`)) {
      return;
    }
    
    try {
      await removeMemberAPI(groupId, userId);
      await loadMembers();
      if (onMemberRemoved) onMemberRemoved(userId);
      alert("Member removed successfully");
    } catch (error) {
      console.error("Error removing member:", error);
      alert(error.response?.data?.message || "Failed to remove member");
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'owner': return 'bg-danger';
      case 'admin': return 'bg-warning text-dark';
      case 'moderator': return 'bg-info text-dark';
      default: return 'bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="group-members">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0">
          <i className="bi bi-people-fill me-2"></i>
          Members ({members.length})
        </h6>
      </div>

      {members.length === 0 ? (
        <p className="text-muted text-center py-3">No members found</p>
      ) : (
        <div className="list-group">
          {members.map((member) => (
            <div key={member.uuid} className="list-group-item d-flex align-items-center p-3">
              <img
                src={member.photo ? `http://localhost:5000${member.photo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name)}&background=0a66c2&color=fff&size=50`}
                alt={member.full_name}
                className="rounded-circle me-3"
                style={{ width: "50px", height: "50px", objectFit: "cover" }}
              />
              
              <div className="flex-grow-1">
                <div className="d-flex align-items-center mb-1">
                  <h6 className="fw-bold mb-0 me-2">{member.full_name}</h6>
                  <span className={`badge ${getRoleBadgeColor(member.role)} rounded-pill`}>
                    {member.role}
                  </span>
                </div>
                <small className="text-muted d-block">
                  {member.affiliation || 'No affiliation'}
                </small>
                <small className="text-muted d-block">
                  <i className="bi bi-envelope me-1"></i>
                  {member.email}
                </small>
                <small className="text-muted">
                  <i className="bi bi-calendar me-1"></i>
                  Joined {new Date(member.joined_at).toLocaleDateString()}
                </small>
              </div>

              {isOwner && member.role !== 'owner' && (
                <div className="dropdown ms-2">
                  <button
                    className="btn btn-sm btn-outline-secondary rounded-circle"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    <i className="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <h6 className="dropdown-header">Change Role</h6>
                    </li>
                    <li>
                      <button
                        className={`dropdown-item ${member.role === 'admin' ? 'active' : ''}`}
                        onClick={() => handleRoleChange(member.user_id, 'admin')}
                      >
                        <i className="bi bi-shield me-2"></i>
                        Admin
                      </button>
                    </li>
                    <li>
                      <button
                        className={`dropdown-item ${member.role === 'moderator' ? 'active' : ''}`}
                        onClick={() => handleRoleChange(member.user_id, 'moderator')}
                      >
                        <i className="bi bi-shield-check me-2"></i>
                        Moderator
                      </button>
                    </li>
                    <li>
                      <button
                        className={`dropdown-item ${member.role === 'member' ? 'active' : ''}`}
                        onClick={() => handleRoleChange(member.user_id, 'member')}
                      >
                        <i className="bi bi-person me-2"></i>
                        Member
                      </button>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={() => handleRemoveMember(member.user_id, member.full_name)}
                      >
                        <i className="bi bi-person-x me-2"></i>
                        Remove from Group
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}