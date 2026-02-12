import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/researcher/Sidebar";
import Topbar from "../../components/researcher/Topbar";
import MobileSidebar from "../../components/researcher/MobileSidebar";
import { ROLES } from "../../components/researcher/roles.config";

export default function AdminLayout({ children }) {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState(ROLES.RESEARCHER);

  useEffect(() => {
    // Get user role from auth context or API
    if (user) {
      setUserRole(user.role || ROLES.RESEARCHER);
    }
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [user]);

  return (
    <div className="admin-layout" data-role={userRole}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR */}
      {isMobile && (
        <MobileSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          userRole={userRole}
        />
      )}

      <div className="d-flex">
        {/* DESKTOP SIDEBAR - Hidden on mobile */}
        {!isMobile && <Sidebar userRole={userRole} />}

        {/* MAIN CONTENT */}
        <div className="main-content">
          <Topbar 
            onMenuClick={() => setSidebarOpen(true)} 
            isMobile={isMobile}
            userRole={userRole}
          />

          <div className="content-container">
            <div className="role-header">
              <div className="container-fluid">
                <div className="role-badge">
                  <span className={`badge role-${userRole}`}>
                    {userRole.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="welcome-text">
                    Welcome, {user?.name || 'Researcher'}!
                  </span>
                </div>
              </div>
            </div>
            
            <div className="container-fluid py-4">
              {children}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-layout {
          --sidebar-width: 260px;
          --topbar-height: 64px;
          --role-header-height: 48px;
          --primary-color: #0a66c2;
          --moderator-color: #28a745;
          --admin-color: #dc3545;
          --content-color: #17a2b8;
        }
        
        .main-content {
          flex: 1;
          min-height: 100vh;
          margin-left: 0;
          transition: margin-left 0.3s ease;
        }
        
        @media (min-width: 992px) {
          .main-content {
            margin-left: var(--sidebar-width);
          }
        }
        
        .role-header {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-bottom: 1px solid #dee2e6;
          height: var(--role-header-height);
          display: flex;
          align-items: center;
          padding: 0;
          position: fixed;
          top: var(--topbar-height);
          left: 0;
          right: 0;
          z-index: 1010;
        }
        
        .role-badge {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        
        .role-researcher {
          background: linear-gradient(135deg, var(--primary-color) 0%, #004182 100%);
          color: white;
        }
        
        .role-group_moderator {
          background: linear-gradient(135deg, var(--moderator-color) 0%, #1e7e34 100%);
          color: white;
        }
        
        .role-platform_admin {
          background: linear-gradient(135deg, var(--admin-color) 0%, #c82333 100%);
          color: white;
        }
        
        .role-content_manager {
          background: linear-gradient(135deg, var(--content-color) 0%, #138496 100%);
          color: white;
        }
        
        .welcome-text {
          font-size: 14px;
          color: #495057;
          font-weight: 500;
        }
        
        .content-container {
          padding-top: calc(var(--topbar-height) + var(--role-header-height) + 20px);
          padding-bottom: 20px;
        }
        
        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1040;
        }
        
        @media (max-width: 768px) {
          .role-header {
            height: 40px;
          }
          
          .role-badge {
            gap: 8px;
          }
          
          .badge {
            padding: 4px 8px;
            font-size: 10px;
          }
          
          .welcome-text {
            font-size: 12px;
          }
          
          .content-container {
            padding-top: calc(var(--topbar-height) + 40px + 20px);
          }
        }
      `}</style>
    </div>
  );
}