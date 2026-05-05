import { Link, useLocation } from "react-router-dom";
import { 
  FaHome, 
  FaUser, 
  FaBook, 
  FaGlobe, 
  FaEnvelope, 
  FaCog,
  FaSignOutAlt,
  FaGraduationCap,
  FaChartLine,
  FaCalendar,
  FaTimes,
  FaUsers
} from "react-icons/fa";

export default function MobileSidebar({ isOpen, onClose }) {
  const location = useLocation();
  
  const menuItems = [
    { path: "/admin/dashboard", icon: <FaHome />, label: "Dashboard" },
    { path: "/admin/profile", icon: <FaUser />, label: "My Profile" },
    { path: "/admin/publications", icon: <FaBook />, label: "Publications" },
    { path: "/admin/network", icon: <FaUsers />, label: "Network" },
    { path: "/admin/messages", icon: <FaEnvelope />, label: "Messages" },
    { path: "/admin/analytics", icon: <FaChartLine />, label: "Analytics" },
    { path: "/admin/events", icon: <FaCalendar />, label: "Events" },
    { path: "/admin/settings", icon: <FaCog />, label: "Settings" },
  ];

  return (
    <div className={`mobile-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="mobile-sidebar-header">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center">
            <div className="logo-icon">
              <FaGraduationCap className="text-primary" size={28} />
            </div>
            <div className="ms-2">
              <h5 className="fw-bold mb-0">ORA Researcher</h5>
              <small className="text-muted">Professional Network</small>
            </div>
          </div>
          <button className="btn btn-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
      </div>

      <nav className="mobile-sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={onClose}
          >
            <div className="nav-icon">{item.icon}</div>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mobile-sidebar-footer">
        <Link
          to="/logout"
          className="logout-item d-flex align-items-center p-3"
          onClick={onClose}
        >
          <FaSignOutAlt className="me-2" />
          <span>Logout</span>
        </Link>
      </div>

      <style jsx>{`
        .mobile-sidebar {
          position: fixed;
          top: 0;
          left: -280px;
          width: 280px;
          height: 100vh;
          background: white;
          z-index: 1050;
          transition: left 0.3s ease;
          box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          padding: 20px;
        }
        
        .mobile-sidebar.open {
          left: 0;
        }
        
        .mobile-sidebar-header {
          border-bottom: 1px solid #e6e9ec;
          padding-bottom: 20px;
        }
        
        .logo-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #0a66c2 0%, #004182 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        
        .btn-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #666;
        }
        
        .mobile-sidebar-nav {
          flex: 1;
          padding-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-radius: 8px;
          color: #666;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        
        .nav-item:hover, .nav-item.active {
          background: #f0f7ff;
          color: #0a66c2;
        }
        
        .nav-icon {
          width: 24px;
          margin-right: 12px;
        }
        
        .mobile-sidebar-footer {
          border-top: 1px solid #e6e9ec;
          padding-top: 16px;
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
      `}</style>
    </div>
  );
}