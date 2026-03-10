import { FaSearch, FaBell, FaEnvelope, FaBars, FaCog } from "react-icons/fa";
import { useState } from "react";
import { useAuth } from "../../components/researcher/context/AuthContext";

export default function Topbar({ onMenuClick, isMobile, userRole }) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Role-based notifications
  const getNotifications = () => {
    switch(userRole) {
      case 'researcher':
        return { messages: 3, notifications: 2 };
      case 'group_moderator':
        return { messages: 3, notifications: 5, reports: 2 };
      case 'platform_admin':
        return { messages: 12, notifications: 8, alerts: 3 };
      case 'content_manager':
        return { messages: 5, notifications: 4, events: 2 };
      default:
        return { messages: 0, notifications: 0 };
    }
  };
  
  const notifications = getNotifications();

  return (
    <div className={`role-topbar role-${userRole}`}>
      <div className="topbar-content">
        {/* Left Side */}
        <div className="d-flex align-items-center gap-3">
          {isMobile && (
            <button className="menu-toggle btn" onClick={onMenuClick}>
              <FaBars size={20} />
            </button>
          )}
          
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder={
                userRole === 'platform_admin' ? "Search users, logs, settings..." :
                userRole === 'content_manager' ? "Search events, news, content..." :
                userRole === 'group_moderator' ? "Search groups, members, reports..." :
                "Search researchers, publications, topics..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="topbar-actions">
          {/* Notifications */}
          <div className="dropdown">
            <button className="action-btn position-relative" data-bs-toggle="dropdown">
              <FaBell size={20} />
              {notifications.notifications > 0 && (
                <span className="notification-badge">{notifications.notifications}</span>
              )}
            </button>
            <div className="dropdown-menu dropdown-menu-end">
              <div className="dropdown-header">
                <h6 className="mb-0">Notifications ({notifications.notifications})</h6>
              </div>
              <div className="dropdown-body">
                {/* Role-specific notifications */}
                {userRole === 'group_moderator' && (
                  <>
                    <div className="notification-item">
                      <div className="notification-icon bg-warning">
                        <FaFlag />
                      </div>
                      <div>
                        <p className="mb-0">New reports to review</p>
                        <small className="text-muted">2 pending reports</small>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <button className="action-btn position-relative">
            <FaEnvelope size={20} />
            {notifications.messages > 0 && (
              <span className="message-badge">{notifications.messages}</span>
            )}
          </button>

          {/* Admin Settings */}
          {(userRole === 'platform_admin' || userRole === 'group_moderator') && (
            <button className="action-btn">
              <FaCog size={20} />
            </button>
          )}

          {/* Profile */}
          <div className="dropdown profile-dropdown">
            <button className="profile-toggle" data-bs-toggle="dropdown">
              <img
                src={user?.avatar || "/default-avatar.png"}
                alt="profile"
                className="profile-img"
              />
              {userRole !== 'researcher' && (
                <span className={`role-indicator role-${userRole}`} />
              )}
            </button>
            <div className="dropdown-menu dropdown-menu-end">
              <div className="dropdown-header p-3">
                <div className="d-flex align-items-center">
                  <img
                    src={user?.avatar || "/default-avatar.png"}
                    alt="profile"
                    className="profile-img-lg me-3"
                  />
                  <div>
                    <h6 className="mb-0 fw-bold">{user?.name || 'User'}</h6>
                    <small className={`text-role-${userRole}`}>
                      {userRole.replace('_', ' ').toUpperCase()}
                    </small>
                  </div>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <a className="dropdown-item" href="/profile">View Profile</a>
              <a className="dropdown-item" href="/settings">Settings</a>
              {(userRole === 'platform_admin' || userRole === 'group_moderator') && (
                <a className="dropdown-item" href="/admin">Admin Panel</a>
              )}
              <a className="dropdown-item text-danger" href="/logout">Logout</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}