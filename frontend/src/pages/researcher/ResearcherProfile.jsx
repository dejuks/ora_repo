import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyProfile,
  updateMyProfile,
  getResearchers,
  createResearchGroup,
  getMyGroups,
  inviteToGroup,
  getGroupInvites,
  cancelInvite,
  resendInvite,
  acceptGroupInvite,
  rejectGroupInvite,
  getMyGroupInvitations,
  // Connection APIs
  sendConnectionRequest,
  getPendingConnectionRequests,
  getSentConnectionRequests,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getMyConnections,
  checkConnectionStatus
} from "../../api/researcher.api";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function ResearcherProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    full_name: "",
    affiliation: "",
    country: "",
    bio: "",
    research_interests: [],
    orcid: "",
    website: "",
    photo: "",
    uuid: null,
    email: ""
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [researchers, setResearchers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Invite modal states
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedResearchers, setSelectedResearchers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [activeInviteTab, setActiveInviteTab] = useState("send");
  const [pendingInvites, setPendingInvites] = useState([]);
  
  // Group invitations received (for current user)
  const [myGroupInvitations, setMyGroupInvitations] = useState([]);
  const [showGroupInvitationsModal, setShowGroupInvitationsModal] = useState(false);
  
  // Connection states
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState({});
  const [showConnectionRequestsModal, setShowConnectionRequestsModal] = useState(false);
  
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    privacy: "public"
  });

  /* ===============================
     LOGOUT FUNCTION
  ================================= */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/researcher/login");
  };

  /* ===============================
     LOAD PROFILE & DATA
  ================================= */
  useEffect(() => {
    const loadData = async () => {
      try {
        const profileData = await getMyProfile();
        setProfile(profileData);
        
        const [
          researchersData, 
          groupsData, 
          connectionsData, 
          pendingRequestsData,
          sentRequestsData,
          myGroupInvitationsData
        ] = await Promise.all([
          getResearchers(),
          getMyGroups(),
          getMyConnections(),
          getPendingConnectionRequests(),
          getSentConnectionRequests(),
          getMyGroupInvitations()
        ]);
        
        // FILTER OUT THE CURRENT USER FROM RESEARCHERS LIST
        const currentUserId = profileData.uuid;
        
        const filteredResearchers = researchersData.filter(researcher => {
          const researcherId = researcher.uuid;
          return researcherId !== currentUserId;
        });
        
        setResearchers(filteredResearchers || []);
        setGroups(groupsData || []);
        setConnections(connectionsData?.connections || []);
        setPendingRequests(pendingRequestsData?.requests || []);
        setSentRequests(sentRequestsData?.requests || []);
        setMyGroupInvitations(myGroupInvitationsData || []);
        
        // Load connection status for all researchers
        const statusMap = {};
        for (const researcher of filteredResearchers) {
          const researcherId = researcher.uuid;
          try {
            const status = await checkConnectionStatus(researcherId);
            statusMap[researcherId] = status?.status || null;
          } catch (error) {
            console.error(`Error checking status for ${researcherId}:`, error);
            statusMap[researcherId] = null;
          }
        }
        setConnectionStatus(statusMap);
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        alert("Failed to load data. Please try again later.");
        localStorage.clear();
        navigate("/researcher/login");
      }
    };
    
    loadData();
  }, [navigate]);

  /* ===============================
     HANDLE INPUT
  ================================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]:
        name === "research_interests"
          ? value.split(",").map(v => v.trim())
          : value
    }));
  };

  /* ===============================
     SAVE PROFILE
  ================================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateMyProfile(profile);
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  /* ===============================
     GROUP FUNCTIONS
  ================================= */
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const newGroupData = await createResearchGroup(newGroup);
      setGroups([...groups, newGroupData]);
      setNewGroup({ name: "", description: "", privacy: "public" });
      setShowCreateGroup(false);
      alert("Group created successfully!");
    } catch (error) {
      console.error("Failed to create group:", error);
      alert("Failed to create group");
    }
  };

  /* ===============================
     GROUP INVITATION RESPONSES (Accept/Reject)
  ================================= */
  
  // Accept group invitation
  const handleAcceptGroupInvite = async (invitation) => {
    try {
      console.log("Accepting group invitation:", invitation);
      
      const response = await acceptGroupInvite(invitation.uuid || invitation.id);
      
      if (response.success) {
        alert(`You have joined ${invitation.group_name || 'the group'}!`);
        
        // Remove from my group invitations
        setMyGroupInvitations(prev => prev.filter(inv => 
          (inv.uuid !== invitation.uuid && inv.id !== invitation.id)
        ));
        
        // Refresh groups to show new group
        const updatedGroups = await getMyGroups();
        setGroups(updatedGroups || []);
      }
    } catch (error) {
      console.error("Failed to accept group invitation:", error);
      alert(error.response?.data?.message || "Failed to accept group invitation");
    }
  };

  // Reject group invitation
  const handleRejectGroupInvite = async (invitation) => {
    if (!window.confirm(`Reject invitation to join ${invitation.group_name || 'the group'}?`)) return;
    
    try {
      console.log("Rejecting group invitation:", invitation);
      
      const response = await rejectGroupInvite(invitation.uuid || invitation.id);
      
      if (response.success) {
        alert(`Invitation to ${invitation.group_name || 'the group'} rejected`);
        
        // Remove from my group invitations
        setMyGroupInvitations(prev => prev.filter(inv => 
          (inv.uuid !== invitation.uuid && inv.id !== invitation.id)
        ));
      }
    } catch (error) {
      console.error("Failed to reject group invitation:", error);
      alert(error.response?.data?.message || "Failed to reject group invitation");
    }
  };

  /* ===============================
     SEND GROUP INVITES (As Owner)
  ================================= */
  
  const closeInviteModal = () => {
    setShowInviteModal(false);
    setSelectedGroup(null);
    setSelectedResearchers([]);
    setSearchTerm("");
    setInviteMessage("");
    setActiveInviteTab("send");
    setPendingInvites([]);
  };

  const openInviteModal = async (group) => {
    setSelectedGroup(group);
    setShowInviteModal(true);
    try {
      const invites = await getGroupInvites(group.uuid);
      console.log("Loaded invites:", invites);
      setPendingInvites(invites || []);
    } catch (error) {
      console.error("Error loading invites:", error);
      setPendingInvites([]);
    }
  };

  const filteredResearchers = researchers.filter(researcher => {
    if (!researcher) return false;
    
    const researcherId = researcher.uuid;
    
    const matchesSearch = 
      researcher.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      researcher.affiliation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      researcher.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Check if already a member
    const isMember = selectedGroup?.members?.some(member => 
      member.user_id === researcherId
    );
    
    // Check if already invited
    const isInvited = pendingInvites.some(invite => {
      if (invite.researcher && invite.researcher.id) {
        return invite.researcher.id === researcherId;
      }
      return invite.invitee_id === researcherId;
    });
    
    return matchesSearch && !isMember && !isInvited;
  });

  const handleSelectAll = () => {
    if (selectedResearchers.length === filteredResearchers.length) {
      setSelectedResearchers([]);
    } else {
      const allIds = filteredResearchers.map(researcher => researcher.uuid);
      setSelectedResearchers(allIds);
    }
  };

  const toggleResearcherSelection = (researcherId) => {
    setSelectedResearchers(prev => 
      prev.includes(researcherId)
        ? prev.filter(id => id !== researcherId)
        : [...prev, researcherId]
    );
  };

  const handleInviteToGroup = async (e) => {
    e.preventDefault();
    
    if (selectedResearchers.length === 0) {
      alert("Please select at least one researcher");
      return;
    }
    
    try {
      console.log("Inviting researchers:", {
        groupId: selectedGroup.uuid,
        researchers: selectedResearchers,
        message: inviteMessage
      });
      
      const response = await inviteToGroup(
        selectedGroup.uuid, 
        selectedResearchers, 
        inviteMessage
      );
      
      console.log("Invite response:", response);
      alert("Invitations sent successfully!");
      
      // Refresh invites
      const invites = await getGroupInvites(selectedGroup.uuid);
      console.log("Refreshed invites:", invites);
      setPendingInvites(invites || []);
      
      // Reset form
      setSelectedResearchers([]);
      setInviteMessage("");
      setActiveInviteTab("manage");
    } catch (error) {
      console.error("Failed to send invitations:", error);
      alert(error.response?.data?.message || "Failed to send invitations");
    }
  };

  const handleCancelInvite = async (inviteId) => {
    if (!window.confirm("Are you sure you want to cancel this invitation?")) return;
    
    try {
      console.log("Cancelling invite:", inviteId);
      const response = await cancelInvite(inviteId);
      console.log("Cancel response:", response);
      
      setPendingInvites(prev => prev.filter(invite => 
        invite.uuid !== inviteId && invite.id !== inviteId
      ));
      
      alert("Invitation cancelled successfully!");
    } catch (error) {
      console.error("Error cancelling invite:", error);
      alert(error.response?.data?.message || "Failed to cancel invitation");
    }
  };

  const handleResendInvite = async (inviteId) => {
    try {
      console.log("Resending invite:", inviteId);
      const response = await resendInvite(inviteId);
      console.log("Resend response:", response);
      alert("Invitation resent successfully!");
    } catch (error) {
      console.error("Error resending invite:", error);
      alert(error.response?.data?.message || "Failed to resend invitation");
    }
  };

  /* ===============================
     CONNECTION FUNCTIONS
  ================================= */
  
  const handleSendConnectionRequest = async (researcher) => {
    if (!researcher) {
      alert("Cannot connect: Researcher information is missing");
      return;
    }
    
    const researcherId = researcher.uuid;
    const researcherName = researcher.full_name || "Unknown Researcher";
    
    if (!researcherId) {
      alert(`Cannot connect to ${researcherName}: ID is missing`);
      return;
    }
    
    const currentUserId = profile.uuid;
    if (researcherId === currentUserId) {
      alert("You cannot connect to yourself");
      return;
    }
    
    try {
      const response = await sendConnectionRequest(researcherId);
      
      if (response.success) {
        alert(`Connection request sent to ${researcherName}!`);
        
        setSentRequests(prev => [...prev, {
          id: response.request_id,
          receiver_id: researcherId,
          receiver_name: researcherName,
          status: 'pending',
          created_at: new Date().toISOString()
        }]);
        
        setConnectionStatus(prev => ({
          ...prev,
          [researcherId]: { status: 'pending_sent' }
        }));
      }
    } catch (error) {
      console.error("Failed to send connection request:", error);
      alert(error.response?.data?.message || "Failed to send connection request");
    }
  };

  const handleAcceptConnection = async (request) => {
    try {
      console.log("Accepting request:", request);
      
      const response = await acceptConnectionRequest(request.id);
      
      if (response.success) {
        alert(`You are now connected with ${request.sender_name}!`);
        
        setPendingRequests(prev => prev.filter(r => r.id !== request.id));
        
        setConnections(prev => [...prev, {
          id: request.id,
          researcher_id: request.sender_id,
          researcher_name: request.sender_name,
          affiliation: request.sender_affiliation,
          photo: request.sender_photo,
          email: request.sender_email,
          connected_at: new Date().toISOString()
        }]);
        
        setConnectionStatus(prev => ({
          ...prev,
          [request.sender_id]: { status: 'connected' }
        }));
      }
    } catch (error) {
      console.error("Failed to accept connection:", error);
      alert(error.response?.data?.message || "Failed to accept connection request");
    }
  };

  const handleRejectConnection = async (request) => {
    if (!window.confirm(`Reject connection request from ${request.sender_name}?`)) return;
    
    try {
      const response = await rejectConnectionRequest(request.id);
      
      if (response.success) {
        alert(`Connection request from ${request.sender_name} rejected`);
        
        setPendingRequests(prev => prev.filter(r => r.id !== request.id));
        
        setConnectionStatus(prev => ({
          ...prev,
          [request.sender_id]: { status: 'rejected' }
        }));
      }
    } catch (error) {
      console.error("Failed to reject connection:", error);
      alert(error.response?.data?.message || "Failed to reject connection request");
    }
  };

  const getConnectionButtonState = (researcher) => {
    const researcherId = researcher.uuid;
    
    const isConnected = connections.some(conn => 
      conn.researcher_id === researcherId
    );
    
    if (isConnected) {
      return {
        text: "Connected",
        variant: "success",
        disabled: true,
        icon: "bi-check-circle-fill"
      };
    }
    
    const receivedRequest = pendingRequests.find(req => 
      req.sender_id === researcherId
    );
    
    if (receivedRequest) {
      return {
        text: "Accept",
        variant: "primary",
        disabled: false,
        icon: "bi-person-check-fill",
        action: () => handleAcceptConnection(receivedRequest)
      };
    }
    
    const sentRequest = sentRequests.find(req => 
      req.receiver_id === researcherId
    );
    
    if (sentRequest) {
      return {
        text: "Pending",
        variant: "secondary",
        disabled: true,
        icon: "bi-clock-fill"
      };
    }
    
    return {
      text: "Connect",
      variant: "outline-primary",
      disabled: false,
      icon: "bi-person-plus-fill",
      action: () => handleSendConnectionRequest(researcher)
    };
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f3f2ef", minHeight: "100vh" }}>
      {/* Navigation with Logout Button */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
        <div className="container">
          <a className="navbar-brand" href="#">
            <span className="fw-bold" style={{ color: "#0a66c2", fontSize: "1.8rem" }}>ORA Researcher Net</span>
          </a>
          <div className="navbar-nav ms-auto d-flex align-items-center">
            {/* Group Invitations Button */}
            {myGroupInvitations.length > 0 && (
              <button 
                className="btn btn-info rounded-pill px-4 me-2 position-relative"
                onClick={() => setShowGroupInvitationsModal(true)}
              >
                <i className="bi bi-envelope-fill me-2"></i>
                Group Invites
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {myGroupInvitations.length}
                </span>
              </button>
            )}
            
            {/* Connection Requests Button */}
            {pendingRequests.length > 0 && (
              <button 
                className="btn btn-warning rounded-pill px-4 me-2 position-relative"
                onClick={() => setShowConnectionRequestsModal(true)}
              >
                <i className="bi bi-person-lines-fill me-2"></i>
                Requests
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {pendingRequests.length}
                </span>
              </button>
            )}
            
            <button 
              className="btn btn-outline-primary rounded-pill px-4 me-2"
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? (
                <>
                  <i className="bi bi-x-lg me-2"></i>
                  Cancel
                </>
              ) : (
                <>
                  <i className="bi bi-pencil me-2"></i>
                  Edit Profile
                </>
              )}
            </button>
            
            <button 
              className="btn btn-primary rounded-pill px-4 me-2"
              onClick={() => setShowCreateGroup(true)}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Create Group
            </button>
            
            {/* Logout Button */}
            <button 
              className="btn btn-outline-danger rounded-pill px-4"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        <div className="row">
          {/* Left Column */}
          <div className="col-lg-8">
            {/* Profile Card */}
            <div className="card rounded-3 shadow-sm border-0 mb-3">
              <div 
                className="rounded-top" 
                style={{
                  height: "200px",
                  background: "linear-gradient(90deg, #0a66c2, #004182)",
                  position: "relative"
                }}
              >
                <div 
                  className="rounded-circle border-4 border-white"
                  style={{
                    width: "140px",
                    height: "140px",
                    position: "absolute",
                    bottom: "-70px",
                    left: "50px",
                    overflow: "hidden",
                    backgroundColor: "#f3f2ef"
                  }}
                >
                  <img
                    src={profile.photo ? `http://localhost:5000${profile.photo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=0a66c2&color=fff&size=140`}
                    alt="avatar"
                    className="w-100 h-100"
                    style={{ objectFit: "cover" }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=0a66c2&color=fff&size=140`;
                    }}
                  />
                </div>
              </div>

              <br />
              <div className="card-body pt-5" style={{ paddingLeft: "50px" }}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h2 className="fw-bold mb-1">{profile.full_name}</h2>
                    <p className="text-muted mb-1">{profile.affiliation || "Affiliation"}</p>
                    <p className="text-muted mb-2">{profile.email}</p>
                    <div className="d-flex align-items-center text-muted mb-3">
                      <i className="bi bi-geo-alt me-2"></i>
                      <span>{profile.country || "Location not specified"}</span>
                    </div>
                  </div>
                </div>

                <hr className="my-4" />

                {editMode ? (
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Affiliation</label>
                        <input
                          className="form-control"
                          name="affiliation"
                          value={profile.affiliation}
                          onChange={handleChange}
                          placeholder="University, Company, etc."
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Country</label>
                        <input
                          className="form-control"
                          name="country"
                          value={profile.country}
                          onChange={handleChange}
                          placeholder="Country"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Bio</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        name="bio"
                        value={profile.bio}
                        onChange={handleChange}
                        placeholder="Tell others about yourself..."
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Research Interests</label>
                      <input
                        className="form-control"
                        name="research_interests"
                        value={profile.research_interests.join(", ")}
                        onChange={handleChange}
                        placeholder="Separate interests with commas"
                      />
                      <div className="form-text">Separate each interest with a comma</div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">ORCID</label>
                        <input
                          className="form-control"
                          name="orcid"
                          value={profile.orcid}
                          onChange={handleChange}
                          placeholder="https://orcid.org/..."
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Website</label>
                        <input
                          className="form-control"
                          name="website"
                          value={profile.website}
                          onChange={handleChange}
                          placeholder="https://your-website.com"
                        />
                      </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                      <button
                        type="button"
                        className="btn btn-outline-secondary rounded-pill px-4"
                        onClick={() => setEditMode(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary rounded-pill px-4"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="mb-4">
                      <h5 className="fw-bold mb-3">About</h5>
                      <p className="text-muted" style={{ lineHeight: "1.6" }}>
                        {profile.bio || "No bio provided."}
                      </p>
                    </div>

                    <div className="mb-4">
                      <h5 className="fw-bold mb-3">Research Interests</h5>
                      <div className="d-flex flex-wrap gap-2">
                        {profile.research_interests?.length > 0 ? (
                          profile.research_interests.map((interest, i) => (
                            <span
                              key={i}
                              className="badge rounded-pill px-3 py-2"
                              style={{
                                backgroundColor: "#eef3f8",
                                color: "#0a66c2",
                                fontSize: "0.9rem"
                              }}
                            >
                              {interest}
                            </span>
                          ))
                        ) : (
                          <p className="text-muted">No interests added.</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Other Researchers Section */}
            <div className="card rounded-3 shadow-sm border-0 mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0">Other Researchers</h5>
                  <span className="badge bg-primary">{researchers.length} researchers</span>
                </div>
                
                <div className="row">
                  {researchers.length > 0 ? (
                    researchers.slice(0, 6).map((researcher) => {
                      const buttonState = getConnectionButtonState(researcher);
                      return (
                        <div key={researcher.uuid} className="col-md-6 col-lg-4 mb-3">
                          <div className="card border-0 hover-shadow">
                            <div className="card-body text-center">
                              <div className="mb-3">
                                <img
                                  src={researcher.photo ? `http://localhost:5000${researcher.photo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(researcher.full_name)}&background=0a66c2&color=fff&size=80`}
                                  alt={researcher.full_name}
                                  className="rounded-circle"
                                  style={{ width: "80px", height: "80px", objectFit: "cover" }}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(researcher.full_name)}&background=0a66c2&color=fff&size=80`;
                                  }}
                                />
                              </div>
                              <h6 className="fw-bold mb-1">{researcher.full_name}</h6>
                              <p className="text-muted small mb-2">{researcher.affiliation || "No affiliation"}</p>
                              <button 
                                className={`btn btn-${buttonState.variant} btn-sm rounded-pill w-100`}
                                onClick={buttonState.action}
                                disabled={buttonState.disabled}
                              >
                                <i className={`bi ${buttonState.icon} me-1`}></i>
                                {buttonState.text}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-12 text-center py-4">
                      <i className="bi bi-people display-5 text-muted mb-3"></i>
                      <p className="text-muted">No other researchers found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* My Groups Section */}
            <div className="card rounded-3 shadow-sm border-0">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0">My Research Groups</h5>
                  <button 
                    className="btn btn-primary btn-sm rounded-pill"
                    onClick={() => setShowCreateGroup(true)}
                  >
                    <i className="bi bi-plus-circle me-1"></i>
                    New Group
                  </button>
                </div>
                
                <div className="row">
                  {groups.length > 0 ? (
                    groups.map((group) => (
                      <div key={group.uuid} className="col-md-6 mb-3">
                        <div className="card border-0 hover-shadow">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="fw-bold mb-0">{group.name}</h6>
                              <span className={`badge ${group.privacy === 'private' ? 'bg-warning' : 'bg-success'}`}>
                                {group.privacy}
                              </span>
                            </div>
                            <p className="text-muted small mb-3">{group.description}</p>
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center">
                                <i className="bi bi-people text-muted me-1"></i>
                                <small className="text-muted">{group.member_count || 0} members</small>
                              </div>
                              <div className="btn-group">
                                <button 
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => navigate(`/groups/${group.uuid}`)}
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                                {group.is_owner && (
                                  <button 
                                    className="btn btn-outline-success btn-sm"
                                    onClick={() => openInviteModal(group)}
                                  >
                                    <i className="bi bi-person-plus"></i>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-12 text-center py-5">
                      <i className="bi bi-people display-1 text-muted mb-3"></i>
                      <p className="text-muted">You haven't created any groups yet.</p>
                      <button 
                        className="btn btn-primary rounded-pill"
                        onClick={() => setShowCreateGroup(true)}
                      >
                        Create Your First Group
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-lg-4">
            {/* Profile Stats Card */}
            <div className="card rounded-3 shadow-sm border-0 mb-3">
              <div className="card-body">
                <h6 className="fw-bold mb-3">Profile Stats</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Connections</span>
                  <span className="fw-bold">{connections.length}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Pending Requests</span>
                  <span className="fw-bold">{pendingRequests.length}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Groups</span>
                  <span className="fw-bold">{groups.length}</span>
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <span className="text-muted">Group Invites</span>
                  <span className="fw-bold text-info">{myGroupInvitations.length}</span>
                </div>
              </div>
            </div>

            {/* Your Connections */}
            <div className="card rounded-3 shadow-sm border-0 mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Your Connections</h6>
                  <span className="badge bg-primary">{connections.length}</span>
                </div>
                {connections.length > 0 ? (
                  connections.slice(0, 5).map((connection) => (
                    <div key={connection.id} className="d-flex align-items-center mb-3">
                      <img
                        src={connection.photo ? `http://localhost:5000${connection.photo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(connection.researcher_name)}&background=0a66c2&color=fff&size=40`}
                        alt={connection.researcher_name}
                        className="rounded-circle me-3"
                        style={{ width: "40px", height: "40px", objectFit: "cover" }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(connection.researcher_name)}&background=0a66c2&color=fff&size=40`;
                        }}
                      />
                      <div className="flex-grow-1">
                        <h6 className="mb-0 fw-semibold">{connection.researcher_name}</h6>
                        <small className="text-muted">{connection.affiliation || "Connected"}</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-center py-3">No connections yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Group Invitations Modal (For receiving invites) */}
      {showGroupInvitationsModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-envelope-fill me-2"></i>
                  Group Invitations ({myGroupInvitations.length})
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowGroupInvitationsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {myGroupInvitations.length > 0 ? (
                  myGroupInvitations.map((invitation) => (
                    <div key={invitation.uuid || invitation.id} className="d-flex align-items-center p-3 border-bottom">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                        <i className="bi bi-people-fill text-primary fs-4"></i>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1 fw-semibold">{invitation.group_name || "Research Group"}</h6>
                        <small className="text-muted d-block">
                          Invited by: {invitation.inviter_name || "Unknown"}
                        </small>
                        {invitation.message && (
                          <small className="text-muted d-block mt-1">
                            <i className="bi bi-chat-left-text me-1"></i>
                            "{invitation.message}"
                          </small>
                        )}
                        <small className="text-muted d-block mt-1">
                          <i className="bi bi-clock me-1"></i>
                          {new Date(invitation.created_at).toLocaleDateString()}
                        </small>
                      </div>
                      <div className="btn-group ms-2">
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => handleAcceptGroupInvite(invitation)}
                          title="Accept"
                        >
                          <i className="bi bi-check-lg"></i> Accept
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRejectGroupInvite(invitation)}
                          title="Reject"
                        >
                          <i className="bi bi-x-lg"></i> Reject
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-envelope-check display-4 text-muted mb-3"></i>
                    <p className="text-muted">No pending group invitations</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowGroupInvitationsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connection Requests Modal */}
      {showConnectionRequestsModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-person-lines-fill me-2"></i>
                  Connection Requests ({pendingRequests.length})
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowConnectionRequestsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {pendingRequests.length > 0 ? (
                  pendingRequests.map((request) => (
                    <div key={request.id} className="d-flex align-items-center p-3 border-bottom">
                      <img
                        src={request.sender_photo ? `http://localhost:5000${request.sender_photo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(request.sender_name)}&background=0a66c2&color=fff&size=50`}
                        alt={request.sender_name}
                        className="rounded-circle me-3"
                        style={{ width: "50px", height: "50px", objectFit: "cover" }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(request.sender_name)}&background=0a66c2&color=fff&size=50`;
                        }}
                      />
                      <div className="flex-grow-1">
                        <h6 className="mb-1 fw-semibold">{request.sender_name}</h6>
                        <small className="text-muted d-block">{request.sender_affiliation || "Researcher"}</small>
                        <small className="text-muted">
                          <i className="bi bi-clock me-1"></i>
                          {new Date(request.created_at).toLocaleDateString()}
                        </small>
                      </div>
                      <div className="btn-group ms-2">
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => handleAcceptConnection(request)}
                          title="Accept"
                        >
                          <i className="bi bi-check-lg"></i> Accept
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRejectConnection(request)}
                          title="Reject"
                        >
                          <i className="bi bi-x-lg"></i> Reject
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-check-circle display-4 text-muted mb-3"></i>
                    <p className="text-muted">No pending connection requests</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowConnectionRequestsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Create Research Group</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowCreateGroup(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateGroup}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Group Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Privacy</label>
                    <select
                      className="form-select"
                      value={newGroup.privacy}
                      onChange={(e) => setNewGroup({...newGroup, privacy: e.target.value})}
                    >
                      <option value="public">Public - Anyone can join</option>
                      <option value="private">Private - Invitation only</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => setShowCreateGroup(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                  >
                    Create Group
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Invite to Group Modal (As Owner) */}
      {showInviteModal && selectedGroup && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  Invite Researchers to {selectedGroup.name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={closeInviteModal}
                ></button>
              </div>
              
              <ul className="nav nav-tabs px-3">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeInviteTab === 'send' ? 'active' : ''}`}
                    onClick={() => setActiveInviteTab('send')}
                  >
                    Send Invites
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeInviteTab === 'manage' ? 'active' : ''}`}
                    onClick={() => setActiveInviteTab('manage')}
                  >
                    Manage Invites ({pendingInvites.length})
                  </button>
                </li>
              </ul>
              
              {activeInviteTab === 'send' && (
                <form onSubmit={handleInviteToGroup}>
                  <div className="modal-body">
                    <p className="text-muted mb-4">
                      Select researchers to invite to this group
                    </p>
                    
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <label className="form-label fw-semibold">Available Researchers</label>
                      {filteredResearchers.length > 0 && (
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="selectAllResearchers"
                            checked={selectedResearchers.length === filteredResearchers.length}
                            onChange={handleSelectAll}
                          />
                          <label 
                            className="form-check-label" 
                            htmlFor="selectAllResearchers"
                          >
                            Select All ({filteredResearchers.length})
                          </label>
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search researchers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <div className="border rounded p-3" style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {filteredResearchers.length > 0 ? (
                        filteredResearchers.map((researcher) => {
                          const researcherId = researcher.uuid;
                          return (
                            <div 
                              key={researcherId}
                              className={`d-flex align-items-center p-2 mb-2 rounded ${selectedResearchers.includes(researcherId) ? 'bg-primary bg-opacity-10' : ''}`}
                              onClick={() => toggleResearcherSelection(researcherId)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="form-check me-3">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={selectedResearchers.includes(researcherId)}
                                  onChange={() => toggleResearcherSelection(researcherId)}
                                />
                              </div>
                              <img
                                src={researcher.photo ? `http://localhost:5000${researcher.photo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(researcher.full_name)}&background=0a66c2&color=fff&size=40`}
                                alt={researcher.full_name}
                                className="rounded-circle me-3"
                                style={{ width: "40px", height: "40px", objectFit: "cover" }}
                              />
                              <div className="flex-grow-1">
                                <h6 className="mb-0 fw-semibold">{researcher.full_name}</h6>
                                <small className="text-muted">{researcher.affiliation}</small>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-4">
                          <i className="bi bi-people display-5 text-muted mb-3"></i>
                          <p className="text-muted">No researchers available</p>
                        </div>
                      )}
                    </div>
                    
                    {selectedResearchers.length > 0 && (
                      <div className="alert alert-info mt-3">
                        <i className="bi bi-info-circle me-2"></i>
                        <strong>{selectedResearchers.length} researcher(s)</strong> selected
                      </div>
                    )}
                    
                    <div className="mt-3">
                      <label htmlFor="inviteMessage" className="form-label">Optional Message</label>
                      <textarea
                        id="inviteMessage"
                        className="form-control"
                        rows="2"
                        placeholder="Add a personal message..."
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={closeInviteModal}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={selectedResearchers.length === 0}
                    >
                      <i className="bi bi-send me-1"></i>
                      Send ({selectedResearchers.length})
                    </button>
                  </div>
                </form>
              )}
              
              {activeInviteTab === 'manage' && (
                <div className="modal-body">
                  <h6 className="fw-semibold mb-3">Pending Invitations</h6>
                  
                  {pendingInvites.length > 0 ? (
                    <div className="border rounded">
                      {pendingInvites.map((invite) => {
                        const researcher = invite.researcher || {
                          full_name: invite.invitee_name || "Unknown",
                          affiliation: invite.invitee_affiliation || "",
                          photo: invite.invitee_photo || null
                        };
                        
                        return (
                          <div key={invite.uuid || invite.id} className="d-flex align-items-center p-3 border-bottom">
                            <img
                              src={researcher.photo ? `http://localhost:5000${researcher.photo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(researcher.full_name)}&background=0a66c2&color=fff&size=40`}
                              alt={researcher.full_name}
                              className="rounded-circle me-3"
                              style={{ width: "40px", height: "40px", objectFit: "cover" }}
                            />
                            <div className="flex-grow-1">
                              <h6 className="mb-0 fw-semibold">{researcher.full_name}</h6>
                              <small className="text-muted">{researcher.affiliation}</small>
                              <div className="text-muted small">
                                <i className="bi bi-clock me-1"></i>
                                Invited on {new Date(invite.created_at).toLocaleDateString()}
                              </div>
                              {invite.message && (
                                <div className="text-muted small mt-1">
                                  <i className="bi bi-chat-left-text me-1"></i>
                                  "{invite.message}"
                                </div>
                              )}
                            </div>
                            <div className="dropdown">
                              <button 
                                className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                              >
                                <i className="bi bi-three-dots"></i>
                              </button>
                              <ul className="dropdown-menu">
                                <li>
                                  <button 
                                    className="dropdown-item text-danger"
                                    onClick={() => handleCancelInvite(invite.uuid || invite.id)}
                                  >
                                    <i className="bi bi-x-circle me-2"></i>
                                    Cancel
                                  </button>
                                </li>
                                <li>
                                  <button 
                                    className="dropdown-item"
                                    onClick={() => handleResendInvite(invite.uuid || invite.id)}
                                  >
                                    <i className="bi bi-arrow-repeat me-2"></i>
                                    Resend
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <i className="bi bi-envelope-check display-5 text-muted mb-3"></i>
                      <p className="text-muted">No pending invitations</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}