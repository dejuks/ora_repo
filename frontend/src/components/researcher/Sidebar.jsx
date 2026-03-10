import { Link, useLocation } from "react-router-dom";
import { getNavigationForRole } from "../../components/researcher/utils/navigationUtils";
import { 
  FaHome, FaUser, FaBook, FaUsers, FaEnvelope, FaCog,
  FaSignOutAlt, FaGraduationCap, FaChartLine, FaCalendar,
  FaShieldAlt, FaFlag, FaTools, FaDatabase, FaBell,
  FaNewspaper, FaBullhorn, FaHandshake, FaFilter,
  FaUserCheck, FaUserFriends, FaClipboardCheck, FaCogs,
  FaEye, FaFileAlt, FaProjectDiagram, FaSearch,
  FaCommentAlt, FaMoneyBillWave, FaRss, FaLayerGroup
} from "react-icons/fa";
import { useState } from "react";

const ICON_MAP = {
  dashboard: <FaHome />,
  profile: <FaUser />,
  publications: <FaBook />,
  projects: <FaProjectDiagram />,
  connections: <FaUserFriends />,
  discover: <FaSearch />,
  groups: <FaUsers />,
  forums: <FaCommentAlt />,
  messages: <FaEnvelope />,
  events: <FaCalendar />,
  funding: <FaMoneyBillWave />,
  news: <FaNewspaper />,
  moderate: <FaShieldAlt />,
  requests: <FaUserCheck />,
  reports: <FaFlag />,
  guidelines: <FaClipboardCheck />,
  admin_dashboard: <FaChartLine />,
  analytics: <FaChartLine />,
  users: <FaUsers />,
  roles: <FaCogs />,
  approvals: <FaUserCheck />,
  activity: <FaEye />,
  settings: <FaCog />,
  security: <FaShieldAlt />,
  maintenance: <FaTools />,
  backup: <FaDatabase />,
  logs: <FaFileAlt />,
  content: <FaNewspaper />,
  categories: <FaLayerGroup />,
  flags: <FaFlag />,
  content_dashboard: <FaChartLine />,
  content_analytics: <FaChartLine />,
  calls: <FaBullhorn />,
  conferences: <FaCalendar />,
  workshops: <FaTools />,
  announcements: <FaBell />,
  notifications: <FaBell />,
  promotions: <FaBullhorn />,
  collaborations: <FaHandshake />,
  featured: <FaStar />,
};

export default function Sidebar({ userRole = 'researcher' }) {
  const location = useLocation();
  const [active, setActive] = useState(location.pathname);
  
  // Get navigation based on role
  const navigation = getNavigationForRole(userRole);

  return (
    <div className="role-sidebar" data-role={userRole}>
      <div className="sidebar-header">
        <div className="d-flex align-items-center mb-4">
          <div className={`logo-icon role-${userRole}`}>
            <FaGraduationCap size={28} />
          </div>
          <div className="ms-2">
            <h5 className="fw-bold mb-0">ORA Network</h5>
            <small className="text-muted">{getRoleDisplayName(userRole)}</small>
          </div>
        </div>
      </div>

      <div className="sidebar-content">
        {navigation.map((section, idx) => (
          <div key={idx} className="sidebar-section">
            <div className="section-header">
              <span className="section-title">{section.section}</span>
            </div>
            <nav className="section-nav">
              {section.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${active === item.path ? 'active' : ''}`}
                  onClick={() => setActive(item.path)}
                >
                  <div className="nav-icon">
                    {ICON_MAP[item.icon] || <FaHome />}
                  </div>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`badge ${item.badgeType || 'bg-primary'} ms-auto`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>

      <div className="sidebar-footer mt-auto">
        <div className="profile-mini d-flex align-items-center p-3">
          <img
            src="/default-avatar.png"
            alt="profile"
            className="profile-img"
          />
          <div className="ms-2">
            <h6 className="mb-0 fw-bold">Dr. Researcher</h6>
            <small className="text-muted">{userRole.replace('_', ' ')}</small>
          </div>
        </div>
        
        <Link
          to="/logout"
          className="logout-item d-flex align-items-center p-3"
        >
          <FaSignOutAlt className="me-2" />
          <span>Logout</span>
        </Link>
      </div>

      <style jsx>{`
        .role-sidebar {
          width: 280px;
          background: #fff;
          border-right: 1px solid #e6e9ec;
          min-height: 100vh;
          padding: 24px 16px;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 1030;
          display: flex;
          flex-direction: column;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
        }
        
        .logo-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        
        .role-researcher .logo-icon {
          background: linear-gradient(135deg, #0a66c2 0%, #004182 100%);
        }
        
        .role-group_moderator .logo-icon {
          background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
        }
        
        .role-platform_admin .logo-icon {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
        }
        
        .role-content_manager .logo-icon {
          background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
        }
        
        .sidebar-content {
          flex: 1;
          overflow-y: auto;
          padding-right: 4px;
        }
        
        .sidebar-section {
          margin-bottom: 24px;
        }
        
        .section-header {
          margin-bottom: 8px;
          padding: 0 8px;
        }
        
        .section-title {
          font-size: 11px;
          text-transform: uppercase;
          color: #6c757d;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        
        .section-nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-radius: 8px;
          color: #495057;
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
          font-size: 14px;
        }
        
        .nav-item:hover {
          background: #f0f7ff;
          color: #0a66c2;
        }
        
        .nav-item.active {
          background: #f0f7ff;
          color: #0a66c2;
          font-weight: 600;
        }
        
        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 24px;
          background: #0a66c2;
          border-radius: 0 3px 3px 0;
        }
        
        .role-group_moderator .nav-item.active::before {
          background: #28a745;
        }
        
        .role-platform_admin .nav-item.active::before {
          background: #dc3545;
        }
        
        .role-content_manager .nav-item.active::before {
          background: #17a2b8;
        }
        
        .nav-icon {
          width: 24px;
          margin-right: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: inherit;
        }
        
        .badge {
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 10px;
          min-width: 20px;
        }
        
        .profile-img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid;
        }
        
        .role-researcher .profile-img {
          border-color: #0a66c2;
        }
        
        .role-group_moderator .profile-img {
          border-color: #28a745;
        }
        
        .role-platform_admin .profile-img {
          border-color: #dc3545;
        }
        
        .role-content_manager .profile-img {
          border-color: #17a2b8;
        }
        
        .logout-item {
          color: #dc3545;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .logout-item:hover {
          background: #ffe6e6;
        }
        
        @media (max-width: 991px) {
          .role-sidebar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

// Helper functions
function getRoleDisplayName(role) {
  const displayNames = {
    researcher: "Researcher Portal",
    group_moderator: "Group Moderator",
    platform_admin: "Platform Admin",
    content_manager: "Content Manager"
  };
  return displayNames[role] || "User Portal";
}