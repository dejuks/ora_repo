import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyProfile,
  updateMyProfile,
  getResearchers,
  searchResearchers,
  createResearchGroup,
  getMyGroups,
  inviteToGroup,
  getGroupInvites,
  cancelInvite,
  resendInvite,
  acceptGroupInvite,
  rejectGroupInvite,
  getMyGroupInvitations,
  leaveGroup,
  deleteGroup,
  // Publications
  getMyPublications,
  createPublication,
  updatePublication,
  deletePublication,
  getAllPublications,
  likePublication,
  unlikePublication,
  commentOnPublication,
  getPublicationComments,
  // Messaging
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadMessageCount,
  // Forum
  getGroupPosts,
  createGroupPost,
  deleteGroupPost,
  likePost,
  unlikePost,
  commentOnPost,
  // Project Updates
  getProjectUpdates,
  createProjectUpdate,
  deleteProjectUpdate,
  getAllProjectUpdates,
  // Connections
  sendConnectionRequest,
  getPendingConnectionRequests,
  getSentConnectionRequests,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getMyConnections,
  checkConnectionStatus,
  removeConnection,
  // Membership
  getMembershipStatus,
} from "../../api/researcher.api";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function ResearcherProfile() {
  const navigate = useNavigate();

  // Profile state
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
    email: "",
    member_ship_status: "none", // Single column for membership
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  // Edit Profile Modal State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    full_name: "",
    affiliation: "",
    country: "",
    bio: "",
    research_interests: [],
    orcid: "",
    website: "",
    photo: null,
    request_membership: false
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Researchers & Search
  const [researchers, setResearchers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Groups
  const [groups, setGroups] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedResearchers, setSelectedResearchers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [activeInviteTab, setActiveInviteTab] = useState("send");
  const [pendingInvites, setPendingInvites] = useState([]);
  const [myGroupInvitations, setMyGroupInvitations] = useState([]);
  const [showGroupInvitationsModal, setShowGroupInvitationsModal] =
    useState(false);
  const [showGroupPostsModal, setShowGroupPostsModal] = useState(false);
  const [selectedGroupForPosts, setSelectedGroupForPosts] = useState(null);
  const [groupPosts, setGroupPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");

  // Publications
  const [publications, setPublications] = useState([]);
  const [allPublications, setAllPublications] = useState([]);
  const [showCreatePublication, setShowCreatePublication] = useState(false);
  const [showPublicationModal, setShowPublicationModal] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [publicationComments, setPublicationComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newPublication, setNewPublication] = useState({
    title: "",
    authors: "",
    journal: "",
    year: new Date().getFullYear(),
    doi: "",
    abstract: "",
    file: null,
  });
  
  // Project Updates
  const [projectUpdates, setProjectUpdates] = useState([]);
  const [allProjectUpdates, setAllProjectUpdates] = useState([]);
  const [showCreateUpdate, setShowCreateUpdate] = useState(false);
  const [selectedGroupForUpdate, setSelectedGroupForUpdate] = useState(null);
  const [newUpdate, setNewUpdate] = useState({
    title: "",
    content: "",
    status: "in_progress"
  });

  // Messaging
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showMessagingModal, setShowMessagingModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedUserForMessage, setSelectedUserForMessage] = useState(null);

  // Connection states
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState({});
  const [showConnectionRequestsModal, setShowConnectionRequestsModal] =
    useState(false);

  // ===============================
  // EDIT PROFILE FUNCTIONS
  // ===============================

  const handleEditProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditProfileForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleResearchInterestsChange = (e) => {
    const inputValue = e.target.value;
    const interests = inputValue.split(',')
      .map(i => i.trim())
      .filter(i => i.length > 0);
    
    setEditProfileForm(prev => ({
      ...prev,
      research_interests: interests
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditProfileForm(prev => ({
        ...prev,
        photo: file
      }));
    }
  };

  const openEditProfileModal = () => {
    // Parse research interests if they're stored as JSON string
    let researchInterests = profile.research_interests || [];
    if (typeof researchInterests === 'string') {
      try {
        researchInterests = JSON.parse(researchInterests);
      } catch (e) {
        researchInterests = researchInterests.split(',').map(i => i.trim());
      }
    }
    
    setEditProfileForm({
      full_name: profile.full_name || "",
      affiliation: profile.affiliation || "",
      country: profile.country || "",
      bio: profile.bio || "",
      research_interests: researchInterests,
      orcid: profile.orcid || "",
      website: profile.website || "",
      photo: null,
      request_membership: false
    });
    setShowEditProfileModal(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUploadingPhoto(true);
    
    try {
      const formData = new FormData();
      
      formData.append('full_name', editProfileForm.full_name || '');
      formData.append('affiliation', editProfileForm.affiliation || '');
      formData.append('country', editProfileForm.country || '');
      formData.append('bio', editProfileForm.bio || '');
      
      const interests = Array.isArray(editProfileForm.research_interests) 
        ? editProfileForm.research_interests 
        : [];
      formData.append('research_interests', JSON.stringify(interests));
      
      formData.append('orcid', editProfileForm.orcid || '');
      formData.append('website', editProfileForm.website || '');
      
      if (editProfileForm.photo instanceof File) {
        formData.append('photo', editProfileForm.photo);
      }
      
      // If requesting membership, set the status to 'pending'
      // This assumes your backend will handle this field
      if (editProfileForm.request_membership) {
        formData.append('member_ship_status', 'pending');
      }
      
      console.log('Sending FormData:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[0] === 'photo' ? '[File]' : pair[1]));
      }
      
      const updatedProfile = await updateMyProfile(formData);
      
      console.log('Profile updated successfully:', updatedProfile);
      
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
      
      if (editProfileForm.request_membership) {
        alert('Your membership request has been sent to the moderators for approval.');
      } else {
        alert('Profile updated successfully!');
      }
      
      setShowEditProfileModal(false);
      setEditMode(false);
      
      const freshProfile = await getMyProfile();
      setProfile(freshProfile);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to update profile';
      alert(errorMessage);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ===============================
  // INVITE FUNCTIONS
  // ===============================

  const closeInviteModal = () => {
    console.log("Closing invite modal");
    setShowInviteModal(false);
    setSelectedGroup(null);
    setSelectedResearchers([]);
    setSearchTerm("");
    setInviteMessage("");
    setActiveInviteTab("send");
    setPendingInvites([]);
  };

  const openInviteModal = async (group) => {
    console.log("Opening invite modal for group:", group);
    setSelectedGroup(group);
    setShowInviteModal(true);
    setActiveInviteTab("send");
    setSearchTerm("");
    setSelectedResearchers([]);
    setInviteMessage("");

    try {
      const invites = await getGroupInvites(group.uuid);
      console.log("Loaded invites:", invites);
      setPendingInvites(invites || []);
    } catch (error) {
      console.error("Error loading invites:", error);
      setPendingInvites([]);
    }
  };

  const filteredResearchers = researchers.filter((researcher) => {
    if (!researcher) return false;

    const researcherId = researcher.uuid || researcher.id;

    const matchesSearch =
      researcher.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      researcher.affiliation
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      researcher.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const isMember = selectedGroup?.members?.some(
      (member) =>
        member.user_id === researcherId ||
        member.researcher_id === researcherId,
    );

    const isInvited = pendingInvites.some((invite) => {
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
      const allIds = filteredResearchers.map(
        (researcher) => researcher.uuid || researcher.id,
      );
      setSelectedResearchers(allIds);
    }
  };

  const toggleResearcherSelection = (researcherId) => {
    setSelectedResearchers((prev) =>
      prev.includes(researcherId)
        ? prev.filter((id) => id !== researcherId)
        : [...prev, researcherId],
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
        message: inviteMessage,
      });

      const response = await inviteToGroup(
        selectedGroup.uuid,
        selectedResearchers,
        inviteMessage,
      );

      console.log("Invite response:", response);
      alert("Invitations sent successfully!");

      const invites = await getGroupInvites(selectedGroup.uuid);
      setPendingInvites(invites || []);

      setSelectedResearchers([]);
      setInviteMessage("");
      setActiveInviteTab("manage");
    } catch (error) {
      console.error("Failed to send invitations:", error);
      alert(error.response?.data?.message || "Failed to send invitations");
    }
  };

  const handleCancelInvite = async (inviteId) => {
    if (!window.confirm("Are you sure you want to cancel this invitation?"))
      return;

    try {
      console.log("Cancelling invite:", inviteId);
      const response = await cancelInvite(inviteId);
      console.log("Cancel response:", response);

      setPendingInvites((prev) =>
        prev.filter(
          (invite) => invite.uuid !== inviteId && invite.id !== inviteId,
        ),
      );

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
  
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    privacy: "public",
  });

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
          myGroupInvitationsData,
          myPublicationsData,
          allPublicationsData,
          conversationsData,
          unreadCountData,
          allUpdatesData,
        ] = await Promise.all([
          getResearchers(),
          getMyGroups(),
          getMyConnections(),
          getPendingConnectionRequests(),
          getSentConnectionRequests(),
          getMyGroupInvitations(),
          getMyPublications(),
          getAllPublications(),
          getConversations(),
          getUnreadMessageCount(),
          getAllProjectUpdates(),
        ]);

        const currentUserId = profileData.uuid;
        const filteredResearchers = researchersData.filter(
          (researcher) => researcher.uuid !== currentUserId,
        );

        setResearchers(filteredResearchers || []);
        setGroups(groupsData || []);
        setConnections(connectionsData?.connections || []);
        setPendingRequests(pendingRequestsData?.requests || []);
        setSentRequests(sentRequestsData?.requests || []);
        setMyGroupInvitations(myGroupInvitationsData || []);
        setPublications(myPublicationsData || []);
        setAllPublications(allPublicationsData || []);
        setConversations(conversationsData || []);
        setUnreadCount(unreadCountData?.count || 0);
        setAllProjectUpdates(allUpdatesData || []);

        const statusMap = {};
        for (const researcher of filteredResearchers) {
          try {
            const status = await checkConnectionStatus(researcher.uuid);
            statusMap[researcher.uuid] = status?.status || null;
          } catch (error) {
            console.error(`Error checking status:`, error);
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

    const interval = setInterval(async () => {
      try {
        const count = await getUnreadMessageCount();
        setUnreadCount(count?.count || 0);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [navigate]);

  /* ===============================
     SEARCH RESEARCHERS
  ================================= */
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchResearchers(searchQuery);
      const filteredResults = results.filter((r) => r.uuid !== profile.uuid);
      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim() === "") {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  /* ===============================
     PUBLICATIONS
  ================================= */
  const handleCreatePublication = async (e) => {
    e.preventDefault();
    try {
      const publicationData = {
        ...newPublication,
        authors: newPublication.authors.split(",").map((a) => a.trim()),
      };
      const result = await createPublication(publicationData);
      setPublications([result, ...publications]);
      setAllPublications([result, ...allPublications]);
      setShowCreatePublication(false);
      setNewPublication({
        title: "",
        authors: "",
        journal: "",
        year: new Date().getFullYear(),
        doi: "",
        abstract: "",
        file: null,
      });
      alert("Publication created successfully!");
    } catch (error) {
      console.error("Error creating publication:", error);
      alert("Failed to create publication");
    }
  };

  const handleDeletePublication = async (publicationId) => {
    if (!window.confirm("Are you sure you want to delete this publication?"))
      return;
    try {
      await deletePublication(publicationId);
      setPublications(publications.filter((p) => p.uuid !== publicationId));
      setAllPublications(
        allPublications.filter((p) => p.uuid !== publicationId),
      );
      alert("Publication deleted successfully!");
    } catch (error) {
      console.error("Error deleting publication:", error);
      alert("Failed to delete publication");
    }
  };

  const handleLikePublication = async (publicationId) => {
    try {
      await likePublication(publicationId);
      const updated = await getAllPublications();
      setAllPublications(updated);
    } catch (error) {
      console.error("Error liking publication:", error);
    }
  };

  const handleViewPublication = async (publication) => {
    setSelectedPublication(publication);
    try {
      const comments = await getPublicationComments(publication.uuid);
      setPublicationComments(comments || []);
      setShowPublicationModal(true);
    } catch (error) {
      console.error("Error loading comments:", error);
      setPublicationComments([]);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPublication) return;
    try {
      await commentOnPublication(selectedPublication.uuid, newComment);
      const comments = await getPublicationComments(selectedPublication.uuid);
      setPublicationComments(comments);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  /* ===============================
     GROUP POSTS / FORUM
  ================================= */
  const handleOpenGroupPosts = async (group) => {
    setSelectedGroupForPosts(group);
    try {
      const posts = await getGroupPosts(group.uuid);
      setGroupPosts(posts || []);
      setShowGroupPostsModal(true);
    } catch (error) {
      console.error("Error loading group posts:", error);
      setGroupPosts([]);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !selectedGroupForPosts) return;

    try {
      console.log("Creating post:", {
        groupId: selectedGroupForPosts.uuid,
        content: newPostContent,
      });

      const response = await createGroupPost(
        selectedGroupForPosts.uuid,
        newPostContent,
      );

      console.log("Post created:", response);

      const posts = await getGroupPosts(selectedGroupForPosts.uuid);
      setGroupPosts(posts);

      setNewPostContent("");
    } catch (error) {
      console.error("Error creating post:", error);
      alert(error.response?.data?.message || "Failed to create post");
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await likePost(postId);
      const posts = await getGroupPosts(selectedGroupForPosts.uuid);
      setGroupPosts(posts);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  /* ===============================
     PROJECT UPDATES
  ================================= */
  const handleCreateUpdate = async (e) => {
    e.preventDefault();

    console.log("Current newUpdate state:", newUpdate);
    console.log("Selected group:", selectedGroupForUpdate);

    if (!selectedGroupForUpdate?.uuid) {
      alert("No group selected");
      return;
    }

    if (!newUpdate.title || !newUpdate.title.trim()) {
      alert("Title is required");
      return;
    }

    if (!newUpdate.content || !newUpdate.content.trim()) {
      alert("Content is required");
      return;
    }

    try {
      console.log("Creating project update:", {
        groupId: selectedGroupForUpdate.uuid,
        title: newUpdate.title,
        content: newUpdate.content,
        status: newUpdate.status
      });

      const updateData = {
        title: newUpdate.title.trim(),
        content: newUpdate.content.trim(),
        status: newUpdate.status || "in_progress"
      };

      await createProjectUpdate(
        selectedGroupForUpdate.uuid,
        updateData
      );

      const updates = await getProjectUpdates(selectedGroupForUpdate.uuid);
      setProjectUpdates(updates);
      
      const allUpdates = await getAllProjectUpdates();
      setAllProjectUpdates(allUpdates);
      
      setShowCreateUpdate(false);
      setSelectedGroupForUpdate(null);
      setNewUpdate({
        title: "",
        content: "",
        status: "in_progress"
      });
      
      alert("Project update created successfully!");

    } catch (error) {
      console.error("Error creating update:", error);
      console.error("Error response:", error.response?.data);
      alert(error.response?.data?.message || "Failed to create update");
    }
  };

  /* ===============================
     MESSAGING
  ================================= */
  const handleOpenMessaging = async (user = null) => {
    setSelectedUserForMessage(user);
    setShowMessagingModal(true);
    try {
      const convs = await getConversations();
      setConversations(convs);

      if (user) {
        const existingConv = convs.find((c) => c.participant_id === user.uuid);

        if (existingConv) {
          await handleSelectConversation(existingConv);
        }
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const handleAppealGroupBan = async (groupId) => {
    alert("Appeal functionality - This would send a message to admins");
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    try {
      const msgs = await getMessages(conversation.id);
      setMessages(msgs);
      await markMessagesAsRead(conversation.id);
      setUnreadCount((prev) => Math.max(0, prev - conversation.unread_count));
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      let receiverId;
      if (selectedConversation) {
        receiverId = selectedConversation.participant_id;
      } else if (selectedUserForMessage) {
        receiverId = selectedUserForMessage.uuid;
      } else {
        return;
      }

      await sendMessage(receiverId, newMessage);
      setNewMessage("");

      if (selectedConversation) {
        const msgs = await getMessages(selectedConversation.id);
        setMessages(msgs);
      }

      const convs = await getConversations();
      setConversations(convs);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
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

  const handleLeaveGroup = async (groupId) => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;
    try {
      await leaveGroup(groupId);
      setGroups(groups.filter((g) => g.uuid !== groupId));
      alert("You have left the group");
    } catch (error) {
      console.error("Error leaving group:", error);
      alert("Failed to leave group");
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this group? This action cannot be undone.",
      )
    )
      return;
    try {
      await deleteGroup(groupId);
      setGroups(groups.filter((g) => g.uuid !== groupId));
      alert("Group deleted successfully");
    } catch (error) {
      console.error("Error deleting group:", error);
      alert("Failed to delete group");
    }
  };

  /* ===============================
     GROUP INVITATION RESPONSES
  ================================= */
  const handleAcceptGroupInvite = async (invitation) => {
    try {
      const response = await acceptGroupInvite(invitation.uuid);
      alert(`You have joined ${invitation.group_name}!`);
      setMyGroupInvitations((prev) =>
        prev.filter((inv) => inv.uuid !== invitation.uuid),
      );
      const updatedGroups = await getMyGroups();
      setGroups(updatedGroups || []);
    } catch (error) {
      console.error("Failed to accept group invitation:", error);
      alert(
        error.response?.data?.message || "Failed to accept group invitation",
      );
    }
  };

  const handleRejectGroupInvite = async (invitation) => {
    if (!window.confirm(`Reject invitation to join ${invitation.group_name}?`))
      return;
    try {
      await rejectGroupInvite(invitation.uuid);
      alert(`Invitation to ${invitation.group_name} rejected`);
      setMyGroupInvitations((prev) =>
        prev.filter((inv) => inv.uuid !== invitation.uuid),
      );
    } catch (error) {
      console.error("Failed to reject group invitation:", error);
      alert(
        error.response?.data?.message || "Failed to reject group invitation",
      );
    }
  };

  /* ===============================
     CONNECTION FUNCTIONS
  ================================= */
  const handleSendConnectionRequest = async (researcher) => {
    try {
      const response = await sendConnectionRequest(researcher.uuid);
      alert(`Connection request sent to ${researcher.full_name}!`);
      setSentRequests((prev) => [
        ...prev,
        {
          id: response.request_id,
          receiver_id: researcher.uuid,
          receiver_name: researcher.full_name,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ]);
      setConnectionStatus((prev) => ({
        ...prev,
        [researcher.uuid]: { status: "pending_sent" },
      }));
    } catch (error) {
      console.error("Failed to send connection request:", error);
      alert(
        error.response?.data?.message || "Failed to send connection request",
      );
    }
  };

  const handleAcceptConnection = async (request) => {
    try {
      await acceptConnectionRequest(request.id);
      alert(`You are now connected with ${request.sender_name}!`);
      setPendingRequests((prev) => prev.filter((r) => r.id !== request.id));
      setConnections((prev) => [
        ...prev,
        {
          researcher_id: request.sender_id,
          researcher_name: request.sender_name,
          affiliation: request.sender_affiliation,
          photo: request.sender_photo,
        },
      ]);
      setConnectionStatus((prev) => ({
        ...prev,
        [request.sender_id]: { status: "connected" },
      }));
    } catch (error) {
      console.error("Failed to accept connection:", error);
      alert(
        error.response?.data?.message || "Failed to accept connection request",
      );
    }
  };

  const handleRejectConnection = async (request) => {
    if (
      !window.confirm(`Reject connection request from ${request.sender_name}?`)
    )
      return;
    try {
      await rejectConnectionRequest(request.id);
      alert(`Connection request from ${request.sender_name} rejected`);
      setPendingRequests((prev) => prev.filter((r) => r.id !== request.id));
      setConnectionStatus((prev) => ({
        ...prev,
        [request.sender_id]: { status: "rejected" },
      }));
    } catch (error) {
      console.error("Failed to reject connection:", error);
      alert(
        error.response?.data?.message || "Failed to reject connection request",
      );
    }
  };

  const handleRemoveConnection = async (connection) => {
    if (
      !window.confirm(
        `Remove ${connection.researcher_name} from your connections?`,
      )
    )
      return;
    try {
      await removeConnection(connection.id);
      setConnections((prev) => prev.filter((c) => c.id !== connection.id));
      setConnectionStatus((prev) => ({
        ...prev,
        [connection.researcher_id]: { status: null },
      }));
      alert("Connection removed");
    } catch (error) {
      console.error("Error removing connection:", error);
      alert("Failed to remove connection");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await deleteGroupPost(postId);

      const posts = await getGroupPosts(selectedGroupForPosts.uuid);
      setGroupPosts(posts);

      alert("Post deleted successfully");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert(error.response?.data?.message || "Failed to delete post");
    }
  };

  const getConnectionButtonState = (researcher) => {
    const researcherId = researcher.uuid;

    const isConnected = connections.some(
      (conn) => conn.researcher_id === researcherId,
    );
    if (isConnected) {
      return {
        text: "Connected",
        variant: "success",
        disabled: true,
        icon: "bi-check-circle-fill",
      };
    }

    const receivedRequest = pendingRequests.find(
      (req) => req.sender_id === researcherId,
    );
    if (receivedRequest) {
      return {
        text: "Accept",
        variant: "primary",
        disabled: false,
        icon: "bi-person-check-fill",
        action: () => handleAcceptConnection(receivedRequest),
      };
    }

    const sentRequest = sentRequests.find(
      (req) => req.receiver_id === researcherId,
    );
    if (sentRequest) {
      return {
        text: "Pending",
        variant: "secondary",
        disabled: true,
        icon: "bi-clock-fill",
      };
    }

    return {
      text: "Connect",
      variant: "outline-primary",
      disabled: false,
      icon: "bi-person-plus-fill",
      action: () => handleSendConnectionRequest(researcher),
    };
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/researcher/login");
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Helper function to get membership badge
  const getMembershipBadge = () => {
    const status = profile.member_ship_status || 'none';
    
    switch(status) {
      case 'approved':
        return {
          color: 'success',
          icon: 'bi-patch-check-fill',
          text: 'Verified Member'
        };
      case 'pending':
        return {
          color: 'warning',
          icon: 'bi-hourglass-split',
          text: 'Membership Pending'
        };
      case 'rejected':
        return {
          color: 'danger',
          icon: 'bi-exclamation-triangle-fill',
          text: 'Membership Rejected'
        };
      default:
        return null;
    }
  };

  const membershipBadge = getMembershipBadge();

  return (
    <div style={{ backgroundColor: "#f3f2ef", minHeight: "100vh" }}>
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top">
        <div className="container">
          <a className="navbar-brand" href="#">
            <span
              className="fw-bold"
              style={{ color: "#0a66c2", fontSize: "1.8rem" }}
            >
              ORA Researcher Net
            </span>
          </a>

          {/* Search Bar */}
          <div className="d-flex mx-auto" style={{ width: "400px" }}>
            <div className="input-group">
              <input
                type="text"
                className="form-control rounded-pill-start"
                placeholder="Search researchers..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                className="btn btn-primary rounded-pill-end"
                onClick={handleSearch}
              >
                <i className="bi bi-search"></i>
              </button>
            </div>
          </div>

          <div className="navbar-nav ms-auto d-flex align-items-center">
            {/* Membership Status Button - Only show if not 'none' */}
            {membershipBadge && (
              <button
                className={`btn btn-${membershipBadge.color} rounded-pill px-3 me-2`}
              >
                <i className={`bi ${membershipBadge.icon} me-1`}></i>
                {membershipBadge.text}
              </button>
            )}

            {/* Messages Button */}
            <button
              className="btn btn-outline-primary rounded-pill px-3 me-2 position-relative"
              onClick={() => handleOpenMessaging()}
            >
              <i className="bi bi-chat-dots-fill me-1"></i>
              Messages
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Group Invitations Button */}
            {myGroupInvitations.length > 0 && (
              <button
                className="btn btn-info rounded-pill px-3 me-2 position-relative"
                onClick={() => setShowGroupInvitationsModal(true)}
              >
                <i className="bi bi-envelope-fill me-1"></i>
                Invites
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {myGroupInvitations.length}
                </span>
              </button>
            )}

            {/* Connection Requests Button */}
            {pendingRequests.length > 0 && (
              <button
                className="btn btn-warning rounded-pill px-3 me-2 position-relative"
                onClick={() => setShowConnectionRequestsModal(true)}
              >
                <i className="bi bi-person-lines-fill me-1"></i>
                Requests
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {pendingRequests.length}
                </span>
              </button>
            )}

            <button
              className="btn btn-outline-primary rounded-pill px-3 me-2"
              onClick={openEditProfileModal}
            >
              <i className="bi bi-pencil me-1"></i>
              Edit
            </button>

            <button
              className="btn btn-primary rounded-pill px-3 me-2"
              onClick={() => setShowCreateGroup(true)}
            >
              <i className="bi bi-plus-circle me-1"></i>
              Create Group
            </button>

            <button
              className="btn btn-outline-danger rounded-pill px-3"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Search Results Dropdown */}
      {isSearching && searchResults.length > 0 && (
        <div className="container mt-2">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold">
                Search Results ({searchResults.length})
              </h6>
              <button
                className="btn btn-sm btn-link text-secondary"
                onClick={() => setIsSearching(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div
              className="card-body p-2"
              style={{ maxHeight: "400px", overflowY: "auto" }}
            >
              {searchResults.map((researcher) => {
                const buttonState = getConnectionButtonState(researcher);
                return (
                  <div
                    key={researcher.uuid}
                    className="d-flex align-items-center p-2 border-bottom"
                  >
                    <img
                      src={
                        researcher.photo
                          ? `http://localhost:5000${researcher.photo}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(researcher.full_name)}&background=0a66c2&color=fff&size=50`
                      }
                      alt={researcher.full_name}
                      className="rounded-circle me-3"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                    <div className="flex-grow-1">
                      <h6 className="mb-0 fw-semibold">
                        {researcher.full_name}
                      </h6>
                      <small className="text-muted">
                        {researcher.affiliation}
                      </small>
                      <div className="mt-1">
                        {researcher.research_interests
                          ?.slice(0, 2)
                          .map((interest, i) => (
                            <span
                              key={i}
                              className="badge bg-light text-primary me-1"
                            >
                              {interest}
                            </span>
                          ))}
                      </div>
                    </div>
                    <div className="btn-group ms-2">
                      <button
                        className={`btn btn-${buttonState.variant} btn-sm rounded-pill me-1`}
                        onClick={buttonState.action}
                        disabled={buttonState.disabled}
                      >
                        <i className={`bi ${buttonState.icon} me-1`}></i>
                        {buttonState.text}
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm rounded-pill"
                        onClick={() => handleOpenMessaging(researcher)}
                      >
                        <i className="bi bi-chat"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="container py-4">
        {/* Main Tabs */}
        <ul className="nav nav-tabs mb-4 bg-white rounded p-1 shadow-sm">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "profile" ? "active fw-bold" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <i className="bi bi-person-circle me-1"></i> Profile
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "publications" ? "active fw-bold" : ""}`}
              onClick={() => setActiveTab("publications")}
            >
              <i className="bi bi-file-text me-1"></i> Publications
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "updates" ? "active fw-bold" : ""}`}
              onClick={() => setActiveTab("updates")}
            >
              <i className="bi bi-megaphone me-1"></i> Project Updates
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "groups" ? "active fw-bold" : ""}`}
              onClick={() => setActiveTab("groups")}
            >
              <i className="bi bi-people me-1"></i> Groups
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "network" ? "active fw-bold" : ""}`}
              onClick={() => setActiveTab("network")}
            >
              <i className="bi bi-diagram-3 me-1"></i> Network
            </button>
          </li>
        </ul>

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="row">
            <div className="col-lg-4">
              {/* Profile Card */}
              <div className="card rounded-3 shadow-sm border-0 mb-3">
                <div
                  className="rounded-top"
                  style={{
                    height: "120px",
                    background: "linear-gradient(90deg, #0a66c2, #004182)",
                  }}
                />
                <div className="text-center mt-n5">
                  <img
                    src={
                      profile.photo
                        ? `http://localhost:5000${profile.photo}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=0a66c2&color=fff&size=120`
                    }
                    alt={profile.full_name}
                    className="rounded-circle border-4 border-white shadow"
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                    }}
                  />
                  
                  {/* Membership Status Badge */}
                  {membershipBadge && (
                    <div className="mt-2">
                      <span className={`badge bg-${membershipBadge.color} px-3 py-2`}>
                        <i className={`bi ${membershipBadge.icon} me-1`}></i>
                        {membershipBadge.text}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="card-body text-center">
                  <h4 className="fw-bold mb-1">{profile.full_name}</h4>
                  <p className="text-muted mb-2">
                    {profile.affiliation || "Affiliation not specified"}
                  </p>
                  <p className="text-muted small mb-2">{profile.email}</p>
                  <div className="d-flex justify-content-center gap-2 mb-3">
                    <span className="badge bg-primary">
                      {connections.length} connections
                    </span>
                    <span className="badge bg-info">
                      {groups.length} groups
                    </span>
                    <span className="badge bg-success">
                      {publications.length} publications
                    </span>
                  </div>
                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-outline-primary rounded-pill"
                      onClick={openEditProfileModal}
                    >
                      <i className="bi bi-pencil me-2"></i>
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>

              {/* About Card */}
              <div className="card rounded-3 shadow-sm border-0 mb-3">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">About</h6>
                  <p className="text-muted">
                    {profile.bio || "No bio provided."}
                  </p>

                  <h6 className="fw-bold mt-4 mb-3">Research Interests</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {profile.research_interests?.length > 0 ? (
                      profile.research_interests.map((interest, i) => (
                        <span
                          key={i}
                          className="badge bg-light text-primary px-3 py-2"
                        >
                          {interest}
                        </span>
                      ))
                    ) : (
                      <p className="text-muted">No interests added.</p>
                    )}
                  </div>

                  <h6 className="fw-bold mt-4 mb-3">Location</h6>
                  <p className="text-muted">
                    <i className="bi bi-geo-alt me-2"></i>
                    {profile.country || "Not specified"}
                  </p>

                  {(profile.orcid || profile.website) && (
                    <>
                      <h6 className="fw-bold mt-4 mb-3">Links</h6>
                      {profile.orcid && (
                        <p className="mb-2">
                          <i className="bi bi-person-badge me-2 text-primary"></i>
                          <a
                            href={profile.orcid}
                            target="_blank"
                            rel="noreferrer"
                            className="text-decoration-none"
                          >
                            ORCID
                          </a>
                        </p>
                      )}
                      {profile.website && (
                        <p className="mb-2">
                          <i className="bi bi-globe me-2 text-primary"></i>
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-decoration-none"
                          >
                            Website
                          </a>
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              {/* Publications Preview */}
              <div className="card rounded-3 shadow-sm border-0 mb-3">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0">Recent Publications</h5>
                  <button
                    className="btn btn-sm btn-primary rounded-pill"
                    onClick={() => setActiveTab("publications")}
                  >
                    View All
                  </button>
                </div>
                <div className="card-body">
                  {publications.length > 0 ? (
                    publications.slice(0, 3).map((pub) => (
                      <div key={pub.uuid} className="mb-3 pb-3 border-bottom">
                        <h6 className="fw-bold mb-1">{pub.title}</h6>
                        <p className="text-muted small mb-1">
                          {pub.authors?.join(", ")}
                        </p>
                        <p className="text-muted small mb-0">
                          <i className="bi bi-journal me-1"></i> {pub.journal} •{" "}
                          {pub.year}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted text-center py-3">
                      No publications yet
                    </p>
                  )}
                </div>
              </div>

              {/* Groups Preview */}
              <div className="card rounded-3 shadow-sm border-0">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0">My Groups</h5>
                  <button
                    className="btn btn-sm btn-primary rounded-pill"
                    onClick={() => setActiveTab("groups")}
                  >
                    View All
                  </button>
                </div>
                <div className="card-body">
                  {groups.length > 0 ? (
                    groups.slice(0, 3).map((group) => (
                      <div
                        key={group.uuid}
                        className="d-flex justify-content-between align-items-center mb-3"
                      >
                        <div>
                          <h6 className="fw-bold mb-1">{group.name}</h6>
                          <p className="text-muted small mb-0">
                            {group.member_count || 0} members
                          </p>
                        </div>
                        <span
                          className={`badge ${group.privacy === "private" ? "bg-warning" : "bg-success"}`}
                        >
                          {group.privacy}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted text-center py-3">No groups yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PUBLICATIONS TAB */}
        {activeTab === "publications" && (
          <div className="row">
            <div className="col-12">
              <div className="card rounded-3 shadow-sm border-0">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h4 className="fw-bold mb-0">Publications</h4>
                  <button
                    className="btn btn-primary rounded-pill px-4"
                    onClick={() => setShowCreatePublication(true)}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Add Publication
                  </button>
                </div>
                {/* My Publications */}
                <h5 className="fw-bold mb-3">My Publications</h5>
                {publications.length > 0 ? (
                  publications.map((pub) => {
                    const authors = Array.isArray(pub.authors)
                      ? pub.authors
                      : pub.authors
                        ? pub.authors
                            .replace(/[{}"]/g, "")
                            .split(",")
                            .map((a) => a.trim())
                        : [];

                    return (
                      <div
                        key={pub.uuid}
                        className="card mb-3 border-0 bg-light"
                      >
                        <div className="card-body">
                          <div className="d-flex justify-content-between">
                            <div className="flex-grow-1">
                              <h5 className="fw-bold mb-2">{pub.title}</h5>
                              <p className="text-muted mb-2">
                                {authors.join(", ")}
                              </p>
                              <p className="text-muted mb-2">
                                <i className="bi bi-journal me-1"></i>{" "}
                                {pub.journal}
                                <span className="mx-2">•</span>
                                <i className="bi bi-calendar me-1"></i>{" "}
                                {pub.year}
                              </p>
                              {pub.doi && (
                                <p className="mb-2">
                                  <i className="bi bi-link-45deg me-1"></i>
                                  <a
                                    href={`https://doi.org/${pub.doi}`}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    DOI: {pub.doi}
                                  </a>
                                </p>
                              )}
                              <p className="text-muted">{pub.abstract}</p>
                            </div>
                            <div className="ms-3">
                              <div className="dropdown">
                                <button
                                  className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                  data-bs-toggle="dropdown"
                                >
                                  <i className="bi bi-three-dots"></i>
                                </button>
                                <ul className="dropdown-menu">
                                  <li>
                                    <button
                                      className="dropdown-item text-danger"
                                      onClick={() =>
                                        handleDeletePublication(pub.uuid)
                                      }
                                    >
                                      <i className="bi bi-trash me-2"></i>
                                      Delete
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted text-center py-4">
                    You haven't added any publications yet.
                  </p>
                )}

                <hr className="my-4" />

                {/* All Publications Feed */}
                <h5 className="fw-bold mb-3">
                  Recent Publications from Network
                </h5>
                {allPublications.length > 0 ? (
                  allPublications
                    .filter((pub) => pub.user_uuid !== profile.uuid)
                    .slice(0, 10)
                    .map((pub) => {
                      const authors = Array.isArray(pub.authors)
                        ? pub.authors
                        : pub.authors
                          ? pub.authors
                              .replace(/[{}"]/g, "")
                              .split(",")
                              .map((a) => a.trim())
                          : [];

                      return (
                        <div
                          key={pub.uuid}
                          className="card mb-3 border-0 hover-shadow"
                        >
                          <div className="card-body">
                            <div className="d-flex">
                              <img
                                src={
                                  pub.user_photo
                                    ? `http://localhost:5000${pub.user_photo}`
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(pub.user_name)}&background=0a66c2&color=fff&size=50`
                                }
                                alt={pub.user_name}
                                className="rounded-circle me-3"
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                }}
                              />
                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between">
                                  <div>
                                    <h6 className="fw-bold mb-1">
                                      {pub.user_name}
                                    </h6>
                                    <p className="text-muted small mb-2">
                                      {pub.user_affiliation}
                                    </p>
                                  </div>
                                  <button
                                    className="btn btn-sm btn-outline-primary rounded-pill"
                                    onClick={() => handleViewPublication(pub)}
                                  >
                                    <i className="bi bi-chat me-1"></i>
                                    {pub.comment_count || 0}
                                  </button>
                                </div>
                                <h5 className="fw-bold mt-2">{pub.title}</h5>
                                <p className="text-muted mb-2">
                                  {authors.join(", ")}
                                </p>
                                <p className="text-muted small mb-2">
                                  <i className="bi bi-journal me-1"></i>{" "}
                                  {pub.journal} • {pub.year}
                                </p>
                                <p className="text-muted">{pub.abstract}</p>
                                <div className="d-flex gap-3 mt-2">
                                  <button
                                    className="btn btn-sm btn-link text-decoration-none p-0"
                                    onClick={() =>
                                      handleLikePublication(pub.uuid)
                                    }
                                  >
                                    <i
                                      className={`bi ${pub.is_liked ? "bi-hand-thumbs-up-fill" : "bi-hand-thumbs-up"} me-1`}
                                    ></i>
                                    {pub.like_count || 0}
                                  </button>
                                  <button
                                    className="btn btn-sm btn-link text-decoration-none p-0"
                                    onClick={() => handleViewPublication(pub)}
                                  >
                                    <i className="bi bi-chat me-1"></i>
                                    {pub.comment_count || 0} comments
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <p className="text-muted text-center py-4">
                    No publications from your network yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PROJECT UPDATES TAB */}
        {activeTab === "updates" && (
          <div className="row">
            <div className="col-12">
              <div className="card rounded-3 shadow-sm border-0">
                <div className="card-header bg-white">
                  <h4 className="fw-bold mb-0">Project Updates</h4>
                </div>
                <div className="card-body">
                  {groups.length > 0 ? (
                    groups.map((group) => (
                      <div key={group.uuid} className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h5 className="fw-bold mb-0">{group.name}</h5>
                          {group.is_owner && (
                            <button 
                              className="btn btn-sm btn-primary rounded-pill"
                              onClick={() => {
                                console.log("Opening update modal for group:", group);
                                setSelectedGroupForUpdate(group);
                                setNewUpdate({
                                  title: "",
                                  content: "",
                                  status: "in_progress"
                                });
                                setShowCreateUpdate(true);
                              }}
                            >
                              <i className="bi bi-plus-circle me-1"></i>
                              Post Update
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-outline-primary rounded-pill"
                            onClick={() => handleOpenGroupPosts(group)}
                          >
                            <i className="bi bi-chat-dots me-1"></i>
                            Forum
                          </button>
                        </div>

                        <div className="ms-3">
                          {projectUpdates
                            .filter((update) => update.group_id === group.uuid)
                            .slice(0, 3)
                            .map((update) => (
                              <div
                                key={update.uuid}
                                className="card mb-2 border-0 bg-light"
                              >
                                <div className="card-body">
                                  <div className="d-flex justify-content-between">
                                    <div>
                                      <h6 className="fw-bold mb-1">
                                        {update.title}
                                      </h6>
                                      <p className="text-muted small mb-2">
                                        {update.content}
                                      </p>
                                      <div className="d-flex align-items-center">
                                        <span
                                          className={`badge ${update.status === "completed" ? "bg-success" : "bg-warning"} me-2`}
                                        >
                                          {update.status}
                                        </span>
                                        <small className="text-muted">
                                          <i className="bi bi-clock me-1"></i>
                                          {new Date(
                                            update.created_at,
                                          ).toLocaleDateString()}
                                        </small>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted text-center py-4">
                      You are not a member of any groups yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GROUPS TAB */}
        {activeTab === "groups" && (
          <div className="row">
            <div className="col-12">
              <div className="card rounded-3 shadow-sm border-0">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h4 className="fw-bold mb-0">My Research Groups</h4>
                  <button
                    className="btn btn-primary rounded-pill px-4"
                    onClick={() => setShowCreateGroup(true)}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Create New Group
                  </button>
                </div>
                <div className="card-body">
                  {groups.length > 0 ? (
                    groups.map((group) => {
                      const status = group.status || 'active';
                      
                      const getStatusColors = () => {
                        switch(status) {
                          case 'ban':
                            return {
                              cardBg: 'bg-danger bg-opacity-10',
                              border: 'border-danger',
                              text: 'text-danger',
                              badge: 'bg-danger',
                              icon: 'bi-ban'
                            };
                          case 'inactive':
                            return {
                              cardBg: 'bg-secondary bg-opacity-10',
                              border: 'border-secondary',
                              text: 'text-secondary',
                              badge: 'bg-secondary',
                              icon: 'bi-pause-circle'
                            };
                          default:
                            return {
                              cardBg: '',
                              border: 'border-0',
                              text: '',
                              badge: 'bg-success',
                              icon: 'bi-check-circle'
                            };
                        }
                      };
                      
                      const statusColors = getStatusColors();
                      const isActive = status === 'active';
                      
                      return (
                        <div
                          key={group.uuid}
                          className={`card mb-3 ${statusColors.border} shadow-sm ${
                            !isActive ? statusColors.cardBg : ''
                          }`}
                        >
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center mb-2 flex-wrap">
                                  <h5 className={`fw-bold mb-0 me-2 ${!isActive ? statusColors.text : ''}`}>
                                    {group.name}
                                  </h5>
                                  
                                  <span
                                    className={`badge me-1 ${
                                      group.privacy === "private" 
                                        ? "bg-warning" 
                                        : "bg-success"
                                    }`}
                                  >
                                    {group.privacy}
                                  </span>
                                  
                                  {!isActive && (
                                    <span className={`badge ${statusColors.badge} me-1`}>
                                      <i className={`bi ${statusColors.icon} me-1`}></i>
                                      {status === 'ban' ? 'Banned' : 'Inactive'}
                                    </span>
                                  )}
                                  
                                  {group.is_owner && isActive && (
                                    <span className="badge bg-primary ms-1">
                                      Owner
                                    </span>
                                  )}
                                </div>
                                
                                <p className={`text-muted mb-3 ${!isActive ? 'opacity-75' : ''}`}>
                                  {group.description}
                                </p>
                                
                                <div className="d-flex align-items-center mb-3">
                                  <i className={`bi bi-people me-1 ${!isActive ? statusColors.text : 'text-muted'}`}></i>
                                  <small className={`me-3 ${!isActive ? statusColors.text : 'text-muted'}`}>
                                    {group.member_count || 0} members
                                  </small>
                                  <i className={`bi bi-calendar me-1 ${!isActive ? statusColors.text : 'text-muted'}`}></i>
                                  <small className={!isActive ? statusColors.text : 'text-muted'}>
                                    Created {new Date(group.created_at).toLocaleDateString()}
                                  </small>
                                </div>
                                
                                {status === 'ban' && group.ban_reason && (
                                  <div className="alert alert-danger py-2 mb-3">
                                    <small>
                                      <i className="bi bi-exclamation-triangle me-1"></i>
                                      <strong>Ban reason:</strong> {group.ban_reason}
                                    </small>
                                  </div>
                                )}
                                
                                {status === 'inactive' && group.inactive_reason && (
                                  <div className="alert alert-secondary py-2 mb-3">
                                    <small>
                                      <i className="bi bi-info-circle me-1"></i>
                                      <strong>Reason:</strong> {group.inactive_reason}
                                    </small>
                                  </div>
                                )}
                              </div>
                              
                              <div className="btn-group ms-3">
                                <button
                                  className={`btn btn-outline-primary btn-sm ${
                                    !isActive ? 'disabled opacity-50' : ''
                                  }`}
                                  onClick={() => isActive && handleOpenGroupPosts(group)}
                                  disabled={!isActive}
                                  title={!isActive ? `This group is ${status}` : "View forum"}
                                >
                                  <i className="bi bi-chat-dots me-1"></i>
                                  Forum
                                </button>
                                
                                {group.is_owner ? (
                                  <>
                                    <button
                                      className={`btn btn-outline-success btn-sm ${
                                        !isActive ? 'disabled opacity-50' : ''
                                      }`}
                                      onClick={() => {
                                        if (isActive) {
                                          setSelectedGroup(group);
                                          setShowInviteModal(true);
                                        }
                                      }}
                                      disabled={!isActive}
                                      title={!isActive ? `Cannot invite to ${status} group` : "Invite members"}
                                    >
                                      <i className="bi bi-person-plus me-1"></i>
                                      Invite
                                    </button>
                                    
                                    {status === 'banned' ? (
                                      <button
                                        className="btn btn-outline-warning btn-sm"
                                        onClick={() => handleAppealGroupBan(group.uuid)}
                                        title="Appeal ban"
                                      >
                                        <i className="bi bi-shield-exclamation me-1"></i>
                                        Appeal
                                      </button>
                                    ) : (
                                      <button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => handleDeleteGroup(group.uuid)}
                                        disabled={!isActive}
                                        title={!isActive ? `Cannot delete ${status} group` : "Delete group"}
                                      >
                                        <i className="bi bi-trash me-1"></i>
                                        Delete
                                      </button>
                                    )}
                                  </>
                                ) : (
                                  <button
                                    className={`btn btn-outline-danger btn-sm ${
                                      !isActive ? 'disabled opacity-50' : ''
                                    }`}
                                    onClick={() => isActive && handleLeaveGroup(group.uuid)}
                                    disabled={!isActive}
                                    title={!isActive ? `Cannot leave ${status} group` : "Leave group"}
                                  >
                                    <i className="bi bi-box-arrow-right me-1"></i>
                                    Leave
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-5">
                      <i className="bi bi-people display-1 text-muted mb-3"></i>
                      <h5 className="text-muted">No groups yet</h5>
                      <p className="text-muted">
                        Create your first research group to collaborate with peers.
                      </p>
                      <button
                        className="btn btn-primary rounded-pill mt-3"
                        onClick={() => setShowCreateGroup(true)}
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        Create Your First Group
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NETWORK TAB */}
        {activeTab === "network" && (
          <div className="row">
            <div className="col-lg-6">
              <div className="card rounded-3 shadow-sm border-0 mb-3">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0">Your Connections</h5>
                  <span className="badge bg-primary">{connections.length}</span>
                </div>
                <div
                  className="card-body"
                  style={{ maxHeight: "500px", overflowY: "auto" }}
                >
                  {connections.length > 0 ? (
                    connections.map((connection) => (
                      <div
                        key={connection.id}
                        className="d-flex align-items-center mb-3 pb-2 border-bottom"
                      >
                        <img
                          src={
                            connection.photo
                              ? `http://localhost:5000${connection.photo}`
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(connection.researcher_name)}&background=0a66c2&color=fff&size=50`
                          }
                          alt={connection.researcher_name}
                          className="rounded-circle me-3"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                          }}
                        />
                        <div className="flex-grow-1">
                          <h6 className="fw-bold mb-1">
                            {connection.researcher_name}
                          </h6>
                          <small className="text-muted d-block">
                            {connection.affiliation}
                          </small>
                        </div>
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-outline-primary rounded-pill"
                            onClick={() =>
                              handleOpenMessaging({
                                uuid: connection.researcher_id,
                                full_name: connection.researcher_name,
                              })
                            }
                          >
                            <i className="bi bi-chat"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger rounded-pill ms-1"
                            onClick={() => handleRemoveConnection(connection)}
                          >
                            <i className="bi bi-person-x"></i>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted text-center py-4">
                      No connections yet
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card rounded-3 shadow-sm border-0">
                <div className="card-header bg-white">
                  <h5 className="fw-bold mb-0">Suggested Researchers</h5>
                </div>
                <div
                  className="card-body"
                  style={{ maxHeight: "500px", overflowY: "auto" }}
                >
                  {researchers.length > 0 ? (
                    researchers
                      .filter(
                        (r) =>
                          !connections.some((c) => c.researcher_id === r.uuid),
                      )
                      .slice(0, 10)
                      .map((researcher) => {
                        const buttonState =
                          getConnectionButtonState(researcher);
                        return (
                          <div
                            key={researcher.uuid}
                            className="d-flex align-items-center mb-3 pb-2 border-bottom"
                          >
                            <img
                              src={
                                researcher.photo
                                  ? `http://localhost:5000${researcher.photo}`
                                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(researcher.full_name)}&background=0a66c2&color=fff&size=50`
                              }
                              alt={researcher.full_name}
                              className="rounded-circle me-3"
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                              }}
                            />
                            <div className="flex-grow-1">
                              <h6 className="fw-bold mb-1">
                                {researcher.full_name}
                              </h6>
                              <small className="text-muted d-block">
                                {researcher.affiliation}
                              </small>
                              <div className="mt-1">
                                {researcher.research_interests
                                  ?.slice(0, 2)
                                  .map((interest, i) => (
                                    <span
                                      key={i}
                                      className="badge bg-light text-primary me-1"
                                    >
                                      {interest}
                                    </span>
                                  ))}
                              </div>
                            </div>
                            <button
                              className={`btn btn-${buttonState.variant} btn-sm rounded-pill`}
                              onClick={buttonState.action}
                              disabled={buttonState.disabled}
                            >
                              <i className={`bi ${buttonState.icon} me-1`}></i>
                              {buttonState.text}
                            </button>
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-muted text-center py-4">
                      No researchers found
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div 
          className="modal fade show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
          onClick={(e) => {
            if (e.target.className === 'modal fade show d-block') {
              setShowEditProfileModal(false);
            }
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-pencil-square me-2"></i>
                  Edit Profile
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowEditProfileModal(false)}
                ></button>
              </div>
              
              <form onSubmit={handleUpdateProfile}>
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  {/* Profile Photo */}
                  <div className="text-center mb-4">
                    <div className="position-relative d-inline-block">
                      <img
                        src={
                          editProfileForm.photo
                            ? URL.createObjectURL(editProfileForm.photo)
                            : profile.photo
                              ? `http://localhost:5000${profile.photo}`
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(editProfileForm.full_name || profile.full_name)}&background=0a66c2&color=fff&size=120`
                        }
                        alt="Profile"
                        className="rounded-circle border-4 border-white shadow"
                        style={{
                          width: '120px',
                          height: '120px',
                          objectFit: 'cover'
                        }}
                      />
                      <label 
                        htmlFor="photo-upload" 
                        className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-2 shadow-sm"
                        style={{ cursor: 'pointer' }}
                      >
                        <i className="bi bi-camera-fill text-white"></i>
                      </label>
                      <input
                        type="file"
                        id="photo-upload"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>

                  <div className="row">
                    {/* Full Name */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-person me-1"></i>
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="full_name"
                        value={editProfileForm.full_name}
                        onChange={handleEditProfileChange}
                        required
                      />
                    </div>

                    {/* Affiliation */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-building me-1"></i>
                        Affiliation
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="affiliation"
                        value={editProfileForm.affiliation}
                        onChange={handleEditProfileChange}
                      />
                    </div>
                  </div>

                  <div className="row">
                    {/* Country */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-geo-alt me-1"></i>
                        Country
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="country"
                        value={editProfileForm.country}
                        onChange={handleEditProfileChange}
                      />
                    </div>

                    {/* ORCID */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-person-badge me-1"></i>
                        ORCID
                      </label>
                      <input
                        type="url"
                        className="form-control"
                        name="orcid"
                        value={editProfileForm.orcid}
                        onChange={handleEditProfileChange}
                        placeholder="https://orcid.org/0000-0000-0000-0000"
                      />
                    </div>
                  </div>

                  {/* Website */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-globe me-1"></i>
                      Website
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      name="website"
                      value={editProfileForm.website}
                      onChange={handleEditProfileChange}
                      placeholder="https://your-website.com"
                    />
                  </div>

                  {/* Bio */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-file-text me-1"></i>
                      Bio
                    </label>
                    <textarea
                      className="form-control"
                      name="bio"
                      rows="4"
                      value={editProfileForm.bio}
                      onChange={handleEditProfileChange}
                      placeholder="Tell us about yourself, your research interests, and experience..."
                    />
                  </div>

                  {/* Research Interests */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-tags me-1"></i>
                      Research Interests
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={editProfileForm.research_interests.join(', ')}
                      onChange={handleResearchInterestsChange}
                      placeholder="e.g., Machine Learning, Neuroscience, Climate Change (separate with commas)"
                    />
                    <div className="form-text">
                      Enter your research interests separated by commas
                    </div>
                  </div>

                  {/* Membership Request Section - Only show if not already approved */}
                  {profile.member_ship_status !== 'approved' && (
                    <div className="card bg-light border-primary mb-3">
                      <div className="card-body">
                        {profile.member_ship_status === 'pending' ? (
                          <div className="alert alert-warning mb-0">
                            <div className="d-flex align-items-center">
                              <i className="bi bi-hourglass-split me-2 fs-5"></i>
                              <div>
                                <strong>Membership Request Pending</strong>
                                <p className="mb-0 small">Your request is being reviewed by moderators.</p>
                              </div>
                            </div>
                          </div>
                        ) : profile.member_ship_status === 'rejected' ? (
                          <div className="alert alert-danger mb-3">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            Your previous request was rejected. You can apply again.
                          </div>
                        ) : null}
                        
                        {(profile.member_ship_status === 'none' || profile.member_ship_status === 'rejected') && (
                          <>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="requestMembership"
                                name="request_membership"
                                checked={editProfileForm.request_membership}
                                onChange={handleEditProfileChange}
                              />
                              <label 
                                className="form-check-label fw-semibold" 
                                htmlFor="requestMembership"
                              >
                                <i className="bi bi-person-check-fill text-primary me-1"></i>
                                Request Membership Status
                              </label>
                            </div>
                            
                            {editProfileForm.request_membership && (
                              <div className="mt-3 p-3 bg-white rounded border">
                                <div className="d-flex">
                                  <i className="bi bi-info-circle-fill text-primary me-2 fs-5"></i>
                                  <div>
                                    <p className="mb-1 fw-semibold">Membership Request</p>
                                    <p className="text-muted small mb-0">
                                      By checking this box, you're requesting to become a verified member. 
                                      Your profile will be reviewed by moderators, and you'll receive 
                                      additional privileges once approved.
                                    </p>
                                    <div className="mt-2">
                                      <span className="badge bg-primary me-1">✓ Access to private groups</span>
                                      <span className="badge bg-primary me-1">✓ Create research teams</span>
                                      <span className="badge bg-primary">✓ Enhanced visibility</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {profile.member_ship_status === 'approved' && (
                    <div className="alert alert-success">
                      <i className="bi bi-patch-check-fill me-2"></i>
                      You are already a verified member!
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill"
                    onClick={() => setShowEditProfileModal(false)}
                    disabled={uploadingPhoto}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill"
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-1"></i>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Publication Modal */}
      {showCreatePublication && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Add New Publication</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreatePublication(false)}
                ></button>
              </div>
              <form onSubmit={handleCreatePublication}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newPublication.title}
                      onChange={(e) =>
                        setNewPublication({
                          ...newPublication,
                          title: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Authors *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newPublication.authors}
                      onChange={(e) =>
                        setNewPublication({
                          ...newPublication,
                          authors: e.target.value,
                        })
                      }
                      placeholder="Separate authors with commas"
                      required
                    />
                    <div className="form-text">
                      Enter author names separated by commas
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Journal</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newPublication.journal}
                        onChange={(e) =>
                          setNewPublication({
                            ...newPublication,
                            journal: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Year</label>
                      <input
                        type="number"
                        className="form-control"
                        value={newPublication.year}
                        onChange={(e) =>
                          setNewPublication({
                            ...newPublication,
                            year: parseInt(e.target.value),
                          })
                        }
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">DOI</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newPublication.doi}
                      onChange={(e) =>
                        setNewPublication({
                          ...newPublication,
                          doi: e.target.value,
                        })
                      }
                      placeholder="10.xxxx/xxxxx"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Abstract</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={newPublication.abstract}
                      onChange={(e) =>
                        setNewPublication({
                          ...newPublication,
                          abstract: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">PDF File</label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf"
                      onChange={(e) =>
                        setNewPublication({
                          ...newPublication,
                          file: e.target.files[0],
                        })
                      }
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowCreatePublication(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Publication
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Publication Details Modal */}
      {showPublicationModal && selectedPublication && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Publication Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPublicationModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <h4 className="fw-bold mb-3">{selectedPublication.title}</h4>
                <p className="text-muted mb-2">
                  {selectedPublication.authors?.join(", ")}
                </p>
                <p className="text-muted mb-3">
                  <i className="bi bi-journal me-1"></i>{" "}
                  {selectedPublication.journal} • {selectedPublication.year}
                </p>
                {selectedPublication.doi && (
                  <p className="mb-3">
                    <i className="bi bi-link-45deg me-1"></i>
                    <a
                      href={`https://doi.org/${selectedPublication.doi}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      DOI: {selectedPublication.doi}
                    </a>
                  </p>
                )}
                <h6 className="fw-bold mb-2">Abstract</h6>
                <p className="text-muted mb-4">
                  {selectedPublication.abstract}
                </p>

                <h6 className="fw-bold mb-3">
                  Comments ({publicationComments.length})
                </h6>
                <div
                  className="mb-3"
                  style={{ maxHeight: "300px", overflowY: "auto" }}
                >
                  {publicationComments.length > 0 ? (
                    publicationComments.map((comment) => (
                      <div key={comment.uuid} className="d-flex mb-3">
                        <img
                          src={
                            comment.user_photo
                              ? `http://localhost:5000${comment.user_photo}`
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user_name)}&background=0a66c2&color=fff&size=40`
                          }
                          alt={comment.user_name}
                          className="rounded-circle me-2"
                          style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "cover",
                          }}
                        />
                        <div className="flex-grow-1">
                          <div className="bg-light rounded p-2">
                            <strong>{comment.user_name}</strong>
                            <p className="mb-0 mt-1">{comment.content}</p>
                          </div>
                          <small className="text-muted">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted text-center">No comments yet</p>
                  )}
                </div>

                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                  />
                  <button
                    className="btn btn-primary rounded-pill px-4"
                    onClick={handleAddComment}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messaging Modal */}
      {showMessagingModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-chat-dots-fill me-2"></i>
                  Messages
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowMessagingModal(false)}
                ></button>
              </div>
              <div className="modal-body p-0">
                <div className="row g-0">
                  <div
                    className="col-4 border-end"
                    style={{ height: "500px", overflowY: "auto" }}
                  >
                    <div className="p-3">
                      <h6 className="fw-bold mb-3">Conversations</h6>
                      {conversations.length > 0 ? (
                        conversations.map((conv) => (
                          <div
                            key={conv.id}
                            className={`d-flex align-items-center p-2 rounded mb-2 ${selectedConversation?.id === conv.id ? "bg-primary bg-opacity-10" : ""}`}
                            style={{ cursor: "pointer" }}
                            onClick={() => handleSelectConversation(conv)}
                          >
                            <img
                              src={
                                conv.participant_photo
                                  ? `http://localhost:5000${conv.participant_photo}`
                                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.participant_name)}&background=0a66c2&color=fff&size=40`
                              }
                              alt={conv.participant_name}
                              className="rounded-circle me-2"
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                              }}
                            />
                            <div className="flex-grow-1 overflow-hidden">
                              <div className="d-flex justify-content-between">
                                <strong className="small">
                                  {conv.participant_name}
                                </strong>
                                <small className="text-muted">
                                  {new Date(
                                    conv.last_message_time,
                                  ).toLocaleDateString()}
                                </small>
                              </div>
                              <p className="text-truncate small mb-0 text-muted">
                                {conv.last_message}
                              </p>
                              {conv.unread_count > 0 && (
                                <span className="badge bg-primary rounded-pill mt-1">
                                  {conv.unread_count}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted text-center py-4">
                          No conversations yet
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="col-8">
                    {selectedConversation || selectedUserForMessage ? (
                      <>
                        <div className="p-3 border-bottom">
                          <div className="d-flex align-items-center">
                            <img
                              src={
                                selectedConversation
                                  ? selectedConversation.participant_photo
                                    ? `http://localhost:5000${selectedConversation.participant_photo}`
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConversation.participant_name)}&background=0a66c2&color=fff&size=40`
                                  : selectedUserForMessage?.photo
                                    ? `http://localhost:5000${selectedUserForMessage.photo}`
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUserForMessage?.full_name)}&background=0a66c2&color=fff&size=40`
                              }
                              alt={
                                selectedConversation?.participant_name ||
                                selectedUserForMessage?.full_name
                              }
                              className="rounded-circle me-2"
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                              }}
                            />
                            <div>
                              <h6 className="fw-bold mb-0">
                                {selectedConversation?.participant_name ||
                                  selectedUserForMessage?.full_name}
                              </h6>
                              <small className="text-muted">
                                {selectedConversation?.participant_affiliation ||
                                  selectedUserForMessage?.affiliation}
                              </small>
                            </div>
                          </div>
                        </div>

                        <div
                          className="p-3"
                          style={{ height: "350px", overflowY: "auto" }}
                        >
                          {messages.length > 0 ? (
                            messages.map((msg) => (
                              <div
                                key={msg.uuid}
                                className={`d-flex mb-3 ${msg.sender_id === profile.uuid ? "justify-content-end" : ""}`}
                              >
                                {msg.sender_id !== profile.uuid && (
                                  <img
                                    src={
                                      msg.sender_photo
                                        ? `http://localhost:5000${msg.sender_photo}`
                                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender_name)}&background=0a66c2&color=fff&size=30`
                                    }
                                    alt={msg.sender_name}
                                    className="rounded-circle me-2 align-self-end"
                                    style={{
                                      width: "30px",
                                      height: "30px",
                                      objectFit: "cover",
                                    }}
                                  />
                                )}
                                <div
                                  className={`rounded p-2 ${msg.sender_id === profile.uuid ? "bg-primary text-white" : "bg-light"}`}
                                  style={{ maxWidth: "70%" }}
                                >
                                  <p className="mb-0 small">{msg.content}</p>
                                  <small
                                    className={`${msg.sender_id === profile.uuid ? "text-white-50" : "text-muted"} d-block text-end mt-1`}
                                  >
                                    {new Date(
                                      msg.created_at,
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </small>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted text-center py-4">
                              No messages yet. Start a conversation!
                            </p>
                          )}
                        </div>

                        <div className="p-3 border-top">
                          <div className="input-group">
                            <input
                              type="text"
                              className="form-control rounded-pill-start"
                              placeholder="Type a message..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyPress={(e) =>
                                e.key === "Enter" && handleSendMessage()
                              }
                            />
                            <button
                              className="btn btn-primary rounded-pill-end"
                              onClick={handleSendMessage}
                            >
                              <i className="bi bi-send"></i>
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{ height: "500px" }}
                      >
                        <div className="text-center">
                          <i className="bi bi-chat-dots display-1 text-muted mb-3"></i>
                          <p className="text-muted">
                            Select a conversation to start messaging
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Group Posts/Forum Modal */}
      {showGroupPostsModal && selectedGroupForPosts && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-chat-dots me-2"></i>
                  {selectedGroupForPosts.name} - Forum
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowGroupPostsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* Create Post */}
                <div className="mb-4">
                  <div className="d-flex gap-2">
                    <img
                      src={
                        profile.photo
                          ? `http://localhost:5000${profile.photo}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=0a66c2&color=fff&size=40`
                      }
                      alt={profile.full_name}
                      className="rounded-circle"
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "cover",
                      }}
                    />
                    <div className="flex-grow-1">
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Share an update with the group..."
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                      ></textarea>
                      <div className="d-flex justify-content-end mt-2">
                        <button
                          className="btn btn-primary rounded-pill px-4"
                          onClick={handleCreatePost}
                          disabled={!newPostContent.trim()}
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Posts Feed */}
                <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                  {groupPosts.length > 0 ? (
                    groupPosts.map((post) => {
                      return (
                        <div
                          key={post.uuid}
                          className="card mb-3 border-0 bg-light"
                        >
                          <div className="card-body">
                            <div className="d-flex">
                              <img
                                src={
                                  post.author_photo
                                    ? `http://localhost:5000${post.author_photo}`
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author_name)}&background=0a66c2&color=fff&size=40`
                                }
                                alt={post.author_name}
                                className="rounded-circle me-3"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  objectFit: "cover",
                                }}
                              />
                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between">
                                  <div>
                                    <strong>{post.author_name}</strong>
                                    <span className="text-muted ms-2 small">
                                      {new Date(
                                        post.created_at,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {post.author_id === profile.uuid && (
                                    <button
                                      className="btn btn-sm btn-link text-danger"
                                      onClick={() =>
                                        handleDeletePost(post.uuid)
                                      }
                                    >
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  )}
                                </div>
                                <p className="mt-2 mb-2">{post.content}</p>
                                <div className="d-flex gap-3">
                                  <button
                                    className="btn btn-sm btn-link text-decoration-none p-0"
                                    onClick={() => handleLikePost(post.uuid)}
                                  >
                                    <i
                                      className={`bi ${post.is_liked ? "bi-hand-thumbs-up-fill" : "bi-hand-thumbs-up"} me-1`}
                                    ></i>
                                    {post.like_count || 0}
                                  </button>
                                  <button className="btn btn-sm btn-link text-decoration-none p-0">
                                    <i className="bi bi-chat me-1"></i>
                                    {post.comment_count || 0}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-muted text-center py-4">
                      No posts yet. Be the first to post!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Update Modal */}
      {showCreateUpdate && selectedGroupForUpdate && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-megaphone me-2"></i>
                  Post Update - {selectedGroupForUpdate.name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowCreateUpdate(false);
                    setSelectedGroupForUpdate(null);
                    setNewUpdate({
                      title: "",
                      content: "",
                      status: "in_progress"
                    });
                  }}
                ></button>
              </div>
              <form onSubmit={handleCreateUpdate}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="updateTitle" className="form-label fw-semibold">
                      Title <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="updateTitle"
                      placeholder="Enter update title"
                      value={newUpdate.title}
                      onChange={(e) => {
                        console.log("Title changed:", e.target.value);
                        setNewUpdate({
                          ...newUpdate,
                          title: e.target.value
                        });
                      }}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="updateContent" className="form-label fw-semibold">
                      Content <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      id="updateContent"
                      rows="4"
                      placeholder="Describe your project update..."
                      value={newUpdate.content}
                      onChange={(e) => {
                        console.log("Content changed:", e.target.value);
                        setNewUpdate({
                          ...newUpdate,
                          content: e.target.value
                        });
                      }}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="updateStatus" className="form-label fw-semibold">
                      Status
                    </label>
                    <select
                      className="form-select"
                      id="updateStatus"
                      value={newUpdate.status}
                      onChange={(e) => {
                        console.log("Status changed:", e.target.value);
                        setNewUpdate({
                          ...newUpdate,
                          status: e.target.value
                        });
                      }}
                    >
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary rounded-pill"
                    onClick={() => {
                      setShowCreateUpdate(false);
                      setSelectedGroupForUpdate(null);
                      setNewUpdate({
                        title: "",
                        content: "",
                        status: "in_progress"
                      });
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary rounded-pill"
                  >
                    <i className="bi bi-send me-1"></i>
                    Post Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Group Invitations Modal */}
      {showGroupInvitationsModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
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
                    <div
                      key={invitation.uuid}
                      className="d-flex align-items-center p-3 border-bottom"
                    >
                      <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                        <i className="bi bi-people-fill text-primary fs-4"></i>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1 fw-semibold">
                          {invitation.group_name}
                        </h6>
                        <small className="text-muted d-block">
                          Invited by: {invitation.inviter_name}
                        </small>
                        {invitation.message && (
                          <small className="text-muted d-block mt-1">
                            <i className="bi bi-chat-left-text me-1"></i>"
                            {invitation.message}"
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
                        >
                          <i className="bi bi-check-lg"></i> Accept
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRejectGroupInvite(invitation)}
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
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
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
                    <div
                      key={request.id}
                      className="d-flex align-items-center p-3 border-bottom"
                    >
                      <img
                        src={
                          request.sender_photo
                            ? `http://localhost:5000${request.sender_photo}`
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(request.sender_name)}&background=0a66c2&color=fff&size=50`
                        }
                        alt={request.sender_name}
                        className="rounded-circle me-3"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                        }}
                      />
                      <div className="flex-grow-1">
                        <h6 className="mb-1 fw-semibold">
                          {request.sender_name}
                        </h6>
                        <small className="text-muted d-block">
                          {request.sender_affiliation || "Researcher"}
                        </small>
                        <small className="text-muted">
                          <i className="bi bi-clock me-1"></i>
                          {new Date(request.created_at).toLocaleDateString()}
                        </small>
                      </div>
                      <div className="btn-group ms-2">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleAcceptConnection(request)}
                        >
                          <i className="bi bi-check-lg"></i> Accept
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRejectConnection(request)}
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
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
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
                      onChange={(e) =>
                        setNewGroup({ ...newGroup, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={newGroup.description}
                      onChange={(e) =>
                        setNewGroup({
                          ...newGroup,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Privacy</label>
                    <select
                      className="form-select"
                      value={newGroup.privacy}
                      onChange={(e) =>
                        setNewGroup({ ...newGroup, privacy: e.target.value })
                      }
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
                  <button type="submit" className="btn btn-primary">
                    Create Group
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Invite to Group Modal */}
      {showInviteModal && selectedGroup && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-person-plus-fill me-2"></i>
                  Invite Researchers to {selectedGroup.name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeInviteModal}
                ></button>
              </div>

              <ul className="nav nav-tabs px-3 pt-2">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeInviteTab === "send" ? "active fw-bold" : ""}`}
                    onClick={() => setActiveInviteTab("send")}
                    style={{ cursor: "pointer" }}
                  >
                    <i className="bi bi-send me-1"></i>
                    Send Invites
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeInviteTab === "manage" ? "active fw-bold" : ""}`}
                    onClick={() => setActiveInviteTab("manage")}
                    style={{ cursor: "pointer" }}
                  >
                    <i className="bi bi-clock-history me-1"></i>
                    Manage Invites ({pendingInvites.length})
                  </button>
                </li>
              </ul>

              {activeInviteTab === "send" && (
                <form onSubmit={handleInviteToGroup}>
                  <div className="modal-body">
                    <p className="text-muted mb-3">
                      Select researchers to invite to{" "}
                      <strong>{selectedGroup.name}</strong>
                    </p>

                    {/* Search and Select All */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="flex-grow-1 me-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search researchers by name, affiliation, or email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      {filteredResearchers.length > 0 && (
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="selectAllResearchers"
                            checked={
                              selectedResearchers.length ===
                                filteredResearchers.length &&
                              filteredResearchers.length > 0
                            }
                            onChange={handleSelectAll}
                          />
                          <label
                            className="form-check-label fw-semibold"
                            htmlFor="selectAllResearchers"
                            style={{ cursor: "pointer" }}
                          >
                            Select All ({filteredResearchers.length})
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Researchers List */}
                    <div
                      className="border rounded p-2"
                      style={{ maxHeight: "300px", overflowY: "auto" }}
                    >
                      {filteredResearchers.length > 0 ? (
                        filteredResearchers.map((researcher) => {
                          const researcherId = researcher.uuid || researcher.id;
                          return (
                            <div
                              key={researcherId}
                              className={`d-flex align-items-center p-2 mb-1 rounded ${selectedResearchers.includes(researcherId) ? "bg-primary bg-opacity-10 border border-primary" : "hover-bg-light"}`}
                              onClick={() =>
                                toggleResearcherSelection(researcherId)
                              }
                              style={{
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                            >
                              <div className="form-check me-3">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={selectedResearchers.includes(
                                    researcherId,
                                  )}
                                  onChange={() =>
                                    toggleResearcherSelection(researcherId)
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              <img
                                src={
                                  researcher.photo
                                    ? `http://localhost:5000${researcher.photo}`
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(researcher.full_name)}&background=0a66c2&color=fff&size=40`
                                }
                                alt={researcher.full_name}
                                className="rounded-circle me-3"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  objectFit: "cover",
                                }}
                              />
                              <div className="flex-grow-1">
                                <h6 className="mb-0 fw-semibold">
                                  {researcher.full_name}
                                </h6>
                                <small className="text-muted">
                                  {researcher.affiliation || "No affiliation"}
                                </small>
                                {researcher.email && (
                                  <div className="text-muted small">
                                    <i className="bi bi-envelope me-1"></i>
                                    {researcher.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-4">
                          <i className="bi bi-people display-5 text-muted mb-3"></i>
                          <p className="text-muted">No researchers available</p>
                          <small className="text-muted">
                            {searchTerm
                              ? "No matching researchers found"
                              : "All researchers are already members or invited"}
                          </small>
                        </div>
                      )}
                    </div>

                    {selectedResearchers.length > 0 && (
                      <div className="alert alert-info mt-3 py-2">
                        <i className="bi bi-info-circle me-2"></i>
                        <strong>{selectedResearchers.length}</strong>{" "}
                        researcher(s) selected
                      </div>
                    )}

                    {/* Optional Message */}
                    <div className="mt-3">
                      <label
                        htmlFor="inviteMessage"
                        className="form-label fw-semibold"
                      >
                        <i className="bi bi-chat-left-text me-1"></i>
                        Optional Message
                      </label>
                      <textarea
                        id="inviteMessage"
                        className="form-control"
                        rows="2"
                        placeholder="Add a personal message to your invitation..."
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-secondary rounded-pill"
                      onClick={closeInviteModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary rounded-pill"
                      disabled={selectedResearchers.length === 0}
                    >
                      <i className="bi bi-send me-1"></i>
                      Send Invitations ({selectedResearchers.length})
                    </button>
                  </div>
                </form>
              )}

              {activeInviteTab === "manage" && (
                <div className="modal-body">
                  <h6 className="fw-semibold mb-3">
                    <i className="bi bi-clock-history me-1"></i>
                    Pending Invitations ({pendingInvites.length})
                  </h6>

                  {pendingInvites.length > 0 ? (
                    <div className="border rounded">
                      {pendingInvites.map((invite) => {
                        const researcher = invite.researcher || {
                          full_name: invite.invitee_name || "Unknown",
                          affiliation: invite.invitee_affiliation || "",
                          photo: invite.invitee_photo || null,
                        };

                        return (
                          <div
                            key={invite.uuid || invite.id}
                            className="d-flex align-items-center p-3 border-bottom"
                          >
                            <img
                              src={
                                researcher.photo
                                  ? `http://localhost:5000${researcher.photo}`
                                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(researcher.full_name)}&background=0a66c2&color=fff&size=40`
                              }
                              alt={researcher.full_name}
                              className="rounded-circle me-3"
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                              }}
                            />
                            <div className="flex-grow-1">
                              <h6 className="mb-0 fw-semibold">
                                {researcher.full_name}
                              </h6>
                              <small className="text-muted">
                                {researcher.affiliation}
                              </small>
                              <div className="text-muted small mt-1">
                                <i className="bi bi-clock me-1"></i>
                                Invited on{" "}
                                {new Date(
                                  invite.created_at,
                                ).toLocaleDateString()}
                              </div>
                              {invite.message && (
                                <div className="text-muted small mt-1">
                                  <i className="bi bi-chat-left-text me-1"></i>"
                                  {invite.message}"
                                </div>
                              )}
                            </div>
                            <div className="dropdown">
                              <button
                                className="btn btn-sm btn-outline-secondary rounded-pill"
                                type="button"
                                data-bs-toggle="dropdown"
                              >
                                <i className="bi bi-three-dots"></i>
                              </button>
                              <ul className="dropdown-menu">
                                <li>
                                  <button
                                    className="dropdown-item text-danger"
                                    onClick={() =>
                                      handleCancelInvite(
                                        invite.uuid || invite.id,
                                      )
                                    }
                                  >
                                    <i className="bi bi-x-circle me-2"></i>
                                    Cancel Invitation
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() =>
                                      handleResendInvite(
                                        invite.uuid || invite.id,
                                      )
                                    }
                                  >
                                    <i className="bi bi-arrow-repeat me-2"></i>
                                    Resend Invitation
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
                      <button
                        className="btn btn-outline-primary btn-sm rounded-pill mt-2"
                        onClick={() => setActiveInviteTab("send")}
                      >
                        <i className="bi bi-plus-circle me-1"></i>
                        Send New Invitations
                      </button>
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