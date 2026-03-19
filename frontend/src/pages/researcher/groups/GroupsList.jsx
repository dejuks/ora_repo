import React, { useEffect, useState } from "react";
import { 
  getGroupsAPI, 
  getGroupMembersPublicAPI
} from "../../../api/researcher.group.api";
import MainLayout from "../../../components/layout/MainLayout";

export default function GroupsList() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Modal states for members view
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState(null);

  useEffect(() => {
    // Get current user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const data = await getGroupsAPI();
      console.log("Groups loaded:", data);
      setGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading groups:", error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to view group members
  const handleViewMembers = async (group) => {
    console.log("Viewing members for group:", group);
    setSelectedGroup(group);
    setShowMembersModal(true);
    setMembersLoading(true);
    setMembersError(null);
    setGroupMembers([]);
    
    try {
      const response = await getGroupMembersPublicAPI(group.uuid);
      console.log("Public API response:", response);
      
      let members = [];
      if (response && response.data) {
        members = response.data;
      } else if (Array.isArray(response)) {
        members = response;
      }
      
      console.log("Extracted members:", members);
      setGroupMembers(members);
    } catch (error) {
      console.error("Error loading group members:", error);
      setMembersError(error.response?.data?.message || error.message || "Failed to load members");
      setGroupMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowMembersModal(false);
    setSelectedGroup(null);
    setGroupMembers([]);
    setMembersError(null);
  };

  // Check if current user is group owner
  const isGroupOwner = (group) => {
    return currentUser && group.created_by === currentUser.uuid;
  };
// if the logged user is role name[Group Moderator] from roles, these based on user_roles, join to roles they can handle all functions
const isGroupAdminOrModerator = (group) => {
  if (!currentUser) return false;
  const member = groupMembers.find(m => m.user_id === currentUser.uuid);
  return member && (member.role === 'admin' || member.role === 'moderator');
};
  // Helper functions
  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'owner': return 'bg-danger';
      case 'admin': return 'bg-warning text-dark';
      case 'moderator': return 'bg-info text-dark';
      default: return 'bg-secondary';
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'owner': return 'bi-crown';
      case 'admin': return 'bi-shield';
      case 'moderator': return 'bi-shield-check';
      default: return 'bi-person';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-fluid">
        <div className="card card-primary mt-3">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3 className="card-title mb-0">Research Groups</h3>
            <span className="badge bg-primary rounded-pill p-2">
              <i className="bi bi-people-fill me-1"></i>
              Total: {groups.length} groups
            </span>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-bordered table-hover table-striped">
                <thead className="thead-dark">
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Creator</th>
                    <th>Members</th>
                    <th>Privacy</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <i className="bi bi-people display-4 text-muted mb-3 d-block"></i>
                        <p className="text-muted mb-0">No groups available.</p>
                        <p className="text-muted small">Create a new group to get started.</p>
                      </td>
                    </tr>
                  ) : (
                    groups.map((g) => (
                      <tr key={g.uuid}>
                        <td className="fw-bold">{g.name}</td>
                        <td>{g.description || 'No description'}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-person-circle me-2 text-primary"></i>
                            {g.creator_name || 'Unknown'}
                            {isGroupOwner(g) && (
                              <span className="badge bg-danger ms-2">Owner</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <button 
                            className="btn btn-link text-decoration-none p-0"
                            onClick={() => handleViewMembers(g)}
                          >
                            <span className="badge bg-info rounded-pill" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                              <i className="bi bi-people-fill me-1"></i>
                              {g.member_count || 0} members
                            </span>
                          </button>
                        </td>
                        <td>
                          <span className={`badge ${g.privacy === 'private' ? 'bg-warning' : 'bg-success'} rounded-pill px-3 py-2`}>
                            <i className={`bi ${g.privacy === 'private' ? 'bi-lock-fill' : 'bi-globe'} me-1`}></i>
                            {g.privacy || 'public'}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleViewMembers(g)}
                              title="View Members"
                            >
                              <i className="bi bi-people"></i>
                            </button>
                            {isGroupOwner(g) && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => alert(`Open membership approvals for group ${g.uuid}`)}
                                title="Approve Members"
                              >
                                <i className="fas fa-user-check"></i>
                              </button>
                            )}
                            {isGroupAdminOrModerator(g) && (
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => alert(`Ban members in group ${g.uuid}`)}
                                title="Ban Group Members"
                              >
                                <i className="fas fa-ban"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Group Members Modal - FIXED */}
      {showMembersModal && selectedGroup && (
        <div 
          className="modal show" 
          style={{ 
            display: 'block',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1050
          }}
          onClick={handleCloseModal}
        >
          <div 
            className="modal-dialog modal-dialog-centered modal-xl" 
            style={{ maxWidth: '1200px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              {/* Modal Header */}
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-people-fill me-2"></i>
                  {selectedGroup.name} - Members ({groupMembers.length})
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCloseModal}
                  aria-label="Close"
                ></button>
              </div>

              {/* Modal Body */}
              <div className="modal-body p-0">
                {membersLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted mt-3">Loading members...</p>
                  </div>
                ) : membersError ? (
                  <div className="text-center py-5">
                    <i className="bi bi-exclamation-triangle display-1 text-danger mb-3"></i>
                    <h5 className="text-danger">Failed to Load Members</h5>
                    <p className="text-muted px-4">{membersError}</p>
                    <button 
                      className="btn btn-primary mt-3"
                      onClick={() => handleViewMembers(selectedGroup)}
                    >
                      <i className="bi bi-arrow-repeat me-2"></i>
                      Try Again
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Members Summary Cards */}
                    <div className="bg-light p-4 border-bottom">
                      <div className="row g-3">
                        <div className="col-md-3">
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                              <i className="bi bi-people-fill text-primary fs-4"></i>
                            </div>
                            <div>
                              <small className="text-muted d-block">Total Members</small>
                              <span className="fw-bold fs-4">{groupMembers.length}</span>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="d-flex align-items-center">
                            <div className="bg-danger bg-opacity-10 rounded-circle p-3 me-3">
                              <i className="bi bi-crown text-danger fs-4"></i>
                            </div>
                            <div>
                              <small className="text-muted d-block">Owners</small>
                              <span className="fw-bold fs-4">
                                {groupMembers.filter(m => m.role === 'owner').length}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="d-flex align-items-center">
                            <div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                              <i className="bi bi-shield text-warning fs-4"></i>
                            </div>
                            <div>
                              <small className="text-muted d-block">Admins</small>
                              <span className="fw-bold fs-4">
                                {groupMembers.filter(m => m.role === 'admin').length}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="d-flex align-items-center">
                            <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                              <i className="bi bi-shield-check text-info fs-4"></i>
                            </div>
                            <div>
                              <small className="text-muted d-block">Moderators</small>
                              <span className="fw-bold fs-4">
                                {groupMembers.filter(m => m.role === 'moderator').length}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Members Grid */}
                    <div style={{ maxHeight: "500px", overflowY: "auto" }} className="p-3">
                      {groupMembers.length === 0 ? (
                        <div className="text-center py-5">
                          <i className="bi bi-people display-1 text-muted mb-3"></i>
                          <h5 className="text-muted">No Members Found</h5>
                          <p className="text-muted">This group doesn't have any members yet.</p>
                        </div>
                      ) : (
                        <div className="row g-3">
                          {groupMembers.map((member, index) => (
                            <div key={member.uuid || member.user_id || index} className="col-md-6 col-lg-4">
                              <div className="card h-100 border shadow-sm">
                                <div className="card-body">
                                  <div className="d-flex">
                                    {/* Avatar */}
                                    <div className="position-relative me-3">
                                      <img
                                        src={member.photo 
                                          ? (member.photo.startsWith('http') 
                                            ? member.photo 
                                            : `http://localhost:5000${member.photo}`)
                                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name || 'User')}&background=0a66c2&color=fff&size=64`}
                                        alt={member.full_name}
                                        className="rounded-circle border"
                                        style={{ width: "64px", height: "64px", objectFit: "cover" }}
                                      />
                                      <div 
                                        className={`position-absolute bottom-0 end-0 ${getRoleBadgeColor(member.role)} rounded-circle`}
                                        style={{ width: "20px", height: "20px", border: "2px solid white" }}
                                        title={member.role}
                                      >
                                        <i className={`bi ${getRoleIcon(member.role)} text-white d-flex justify-content-center align-items-center`} style={{ fontSize: '12px', lineHeight: '20px' }}></i>
                                      </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-grow-1">
                                      <h6 className="fw-bold mb-1">{member.full_name}</h6>
                                      <div className="mb-2">
                                        <span className={`badge ${getRoleBadgeColor(member.role)} rounded-pill`}>
                                          {member.role}
                                        </span>
                                        {member.user_id === selectedGroup.created_by && (
                                          <span className="badge bg-primary rounded-pill ms-1">
                                            Creator
                                          </span>
                                        )}
                                      </div>
                                      <div className="small text-muted">
                                        {member.email && (
                                          <div className="mb-1">
                                            <i className="bi bi-envelope me-1"></i>
                                            {member.email}
                                          </div>
                                        )}
                                        <div>
                                          <i className="bi bi-calendar me-1"></i>
                                          Joined {formatDate(member.joined_at)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}