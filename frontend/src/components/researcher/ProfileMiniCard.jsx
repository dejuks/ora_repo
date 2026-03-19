import { FaEye, FaUsers, FaMapMarkerAlt, FaGraduationCap } from "react-icons/fa";

export default function ProfileMiniCard() {
  const profile = {
    name: "Dr. Abdi Oromo",
    title: "Senior AI Researcher",
    institution: "Stanford University",
    location: "Stanford, CA",
    views: 245,
    connections: 89,
    completion: 85
  };

  return (
    <div className="profile-mini-card">
      <div className="profile-header text-center">
        <div className="profile-image-wrapper position-relative mx-auto">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
            alt="profile"
            className="profile-image"
          />
          <div className="online-status bg-success" />
        </div>
        
        <h5 className="fw-bold mt-3 mb-1">{profile.name}</h5>
        <p className="text-primary mb-2">{profile.title}</p>
        
        <div className="d-flex align-items-center justify-content-center text-muted small mb-3">
          <FaGraduationCap className="me-1" />
          <span>{profile.institution}</span>
        </div>
        
        <div className="d-flex align-items-center justify-content-center text-muted small">
          <FaMapMarkerAlt className="me-1" />
          <span>{profile.location}</span>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-item">
          <div className="stat-icon bg-primary">
            <FaEye />
          </div>
          <div className="stat-content">
            <div className="stat-value">{profile.views}</div>
            <div className="stat-label">Profile Views</div>
          </div>
        </div>
        
        <div className="stat-item">
          <div className="stat-icon bg-success">
            <FaUsers />
          </div>
          <div className="stat-content">
            <div className="stat-value">{profile.connections}</div>
            <div className="stat-label">Connections</div>
          </div>
        </div>
      </div>

      <div className="profile-progress mt-4">
        <div className="d-flex justify-content-between mb-2">
          <span className="small">Profile Strength</span>
          <span className="small fw-bold">{profile.completion}%</span>
        </div>
        <div className="progress">
          <div 
            className="progress-bar bg-primary" 
            style={{ width: `${profile.completion}%` }}
          />
        </div>
        <p className="small text-muted mt-2 mb-0">
          Complete your profile to increase visibility
        </p>
      </div>

      <div className="profile-actions mt-4">
        <button className="btn btn-primary w-100 mb-2">
          Edit Profile
        </button>
        <button className="btn btn-outline-primary w-100">
          Share Profile
        </button>
      </div>

      <style jsx>{`
        .profile-mini-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #e6e9ec;
        }
        
        .profile-header {
          padding-bottom: 20px;
          border-bottom: 1px solid #e6e9ec;
        }
        
        .profile-image-wrapper {
          width: 100px;
          height: 100px;
        }
        
        .profile-image {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid white;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .online-status {
          position: absolute;
          bottom: 8px;
          right: 8px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 3px solid white;
        }
        
        .profile-stats {
          padding: 20px 0;
          border-bottom: 1px solid #e6e9ec;
        }
        
        .stat-item {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .stat-item:last-child {
          margin-bottom: 0;
        }
        
        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-right: 12px;
          flex-shrink: 0;
        }
        
        .stat-value {
          font-size: 20px;
          font-weight: bold;
          color: #333;
          line-height: 1;
        }
        
        .stat-label {
          font-size: 13px;
          color: #666;
        }
        
        .progress {
          height: 8px;
          border-radius: 4px;
          background: #f0f0f0;
          overflow: hidden;
        }
        
        .progress-bar {
          border-radius: 4px;
        }
        
        .profile-actions .btn {
          border-radius: 24px;
          padding: 10px 20px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #0a66c2 0%, #004182 100%);
          border: none;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(10, 102, 194, 0.3);
        }
        
        .btn-outline-primary {
          border: 2px solid #0a66c2;
          color: #0a66c2;
        }
        
        .btn-outline-primary:hover {
          background: #f0f7ff;
          transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
          .profile-mini-card {
            margin-bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
}