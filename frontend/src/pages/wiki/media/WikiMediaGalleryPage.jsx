// WikiMediaGalleryPage.jsx
import React, { useState, useEffect } from 'react';
import { Link,useNavigate } from 'react-router-dom';

import Navbar from '../../../landing/components/Navbar';
import { 
  FaImage, 
  FaVideo, 
  FaFileAlt, 
  FaSearch,
  FaFilter,
  FaUser,
  FaCalendar,
  FaDownload,
  FaTrash,
  FaEdit,
  FaEye
} from 'react-icons/fa';

const WikiMediaGalleryPage = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMedia();
  }, [filter, searchQuery]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:5000/api/wiki/media';
      const params = new URLSearchParams();
      
      if (filter !== 'all') {
        params.append('file_type', filter);
      }
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (params.toString()) {
        url += '?' + params.toString();
      }

      const res = await fetch(url);
      const data = await res.json();
      setMedia(data.data?.media || []);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this media?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/wiki/media/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setMedia(media.filter(m => m.id !== id));
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFileIcon = (type) => {
    if (type === 'image') return <FaImage style={{color: '#4CAF50'}} />;
    if (type === 'video') return <FaVideo style={{color: '#2196F3'}} />;
    return <FaFileAlt style={{color: '#FF9800'}} />;
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Media Gallery</h1>
          <p style={styles.subtitle}>
            Browse and manage free-license media for Oromo Wikipedia
          </p>
          <Link to="/wiki/media/upload" style={styles.uploadButton}>
            <FaImage /> Upload Media
          </Link>
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <div style={styles.searchBox}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          
          <div style={styles.filterButtons}>
            <button
              onClick={() => setFilter('all')}
              style={{
                ...styles.filterButton,
                ...(filter === 'all' ? styles.activeFilter : {})
              }}
            >
              All
            </button>
            <button
              onClick={() => setFilter('image')}
              style={{
                ...styles.filterButton,
                ...(filter === 'image' ? styles.activeFilter : {})
              }}
            >
              <FaImage /> Images
            </button>
            <button
              onClick={() => setFilter('video')}
              style={{
                ...styles.filterButton,
                ...(filter === 'video' ? styles.activeFilter : {})
              }}
            >
              <FaVideo /> Videos
            </button>
            <button
              onClick={() => setFilter('application')}
              style={{
                ...styles.filterButton,
                ...(filter === 'application' ? styles.activeFilter : {})
              }}
            >
              <FaFileAlt /> Documents
            </button>
          </div>
        </div>

        {/* Media Grid */}
        {loading ? (
          <div style={styles.loading}>Loading media...</div>
        ) : (
          <div style={styles.mediaGrid}>
            {media.map(item => (
              <div
                key={item.id}
                style={styles.mediaCard}
                onClick={() => {
                  setSelectedMedia(item);
                  setShowModal(true);
                }}
              >
                <div style={styles.mediaPreview}>
                  {item.file_type === 'image' ? (
                    <img
                      src={`http://localhost:5000${item.file_url}`}
                      alt={item.alt_text || 'Media preview'}
                      style={styles.mediaImage}
                    />
                  ) : (
                    <div style={styles.mediaIcon}>
                      {getFileIcon(item.file_type)}
                    </div>
                  )}
                </div>
                <div style={styles.mediaInfo}>
                  <div style={styles.mediaMeta}>
                    <span style={styles.mediaLicense}>{item.license}</span>
                    <span style={styles.mediaDate}>{formatDate(item.created_at)}</span>
                  </div>
                  <div style={styles.mediaUploader}>
                    <FaUser /> {item.uploaded_by_name || 'Unknown'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Media Modal */}
        {showModal && selectedMedia && (
          <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Media Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  style={styles.closeButton}
                >
                  ×
                </button>
              </div>
              
              <div style={styles.modalContent}>
                {selectedMedia.file_type === 'image' ? (
                  <img
                    src={`http://localhost:5000${selectedMedia.file_url}`}
                    alt={selectedMedia.alt_text}
                    style={styles.modalImage}
                  />
                ) : (
                  <div style={styles.modalFileInfo}>
                    {getFileIcon(selectedMedia.file_type)}
                    <span>File Type: {selectedMedia.file_type}</span>
                  </div>
                )}

                <div style={styles.modalDetails}>
                  <p><strong>License:</strong> {selectedMedia.license}</p>
                  {selectedMedia.alt_text && (
                    <p><strong>Alt Text:</strong> {selectedMedia.alt_text}</p>
                  )}
                  {selectedMedia.caption && (
                    <p><strong>Caption:</strong> {selectedMedia.caption}</p>
                  )}
                  <p><strong>Uploaded by:</strong> {selectedMedia.uploaded_by_name}</p>
                  <p><strong>Date:</strong> {formatDate(selectedMedia.created_at)}</p>
                  {selectedMedia.article_title && (
                    <p>
                      <strong>Article:</strong>{' '}
                      <Link to={`/wiki/article/${selectedMedia.article_slug}`}>
                        {selectedMedia.article_title}
                      </Link>
                    </p>
                  )}
                </div>

                <div style={styles.modalActions}>
                  <a
                    href={`http://localhost:5000${selectedMedia.file_url}`}
                    download
                    style={styles.downloadButton}
                  >
                    <FaDownload /> Download
                  </a>
                  {localStorage.getItem('token') && (
                    <>
                      <button
                        onClick={() => navigate(`/wiki/media/edit/${selectedMedia.id}`)}
                        style={styles.editButton}
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(selectedMedia.id)}
                        style={styles.deleteButton}
                      >
                        <FaTrash /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: "'Inter', sans-serif",
    minHeight: '100vh',
    background: '#f8f9fa'
  },
  header: {
    marginBottom: '30px',
    position: 'relative',
  },
  title: {
    fontSize: '2.5rem',
    color: '#0F3D2E',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#666',
    marginBottom: '20px',
  },
  uploadButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #C9A227 0%, #B38F1F 100%)',
    color: '#0F3D2E',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    transition: 'all 0.3s',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 5px 20px rgba(201,162,39,0.3)',
    },
  },
  filters: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },
  searchBox: {
    flex: 1,
    position: 'relative',
    minWidth: '250px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#999',
  },
  searchInput: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    border: '2px solid #eaeef2',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.3s',
    ':focus': {
      borderColor: '#C9A227',
    },
  },
  filterButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  filterButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '10px 16px',
    border: '2px solid #eaeef2',
    borderRadius: '8px',
    background: 'white',
    color: '#666',
    cursor: 'pointer',
    transition: 'all 0.3s',
    ':hover': {
      borderColor: '#C9A227',
      color: '#0F3D2E',
    },
  },
  activeFilter: {
    background: '#C9A227',
    borderColor: '#C9A227',
    color: '#0F3D2E',
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    color: '#666',
    fontSize: '1.1rem',
  },
  mediaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
  },
  mediaCard: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s',
    border: '1px solid #eaeef2',
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      borderColor: '#C9A227',
    },
  },
  mediaPreview: {
    height: '180px',
    background: '#f8f9fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  mediaIcon: {
    fontSize: '3rem',
  },
  mediaInfo: {
    padding: '15px',
  },
  mediaMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    fontSize: '0.85rem',
  },
  mediaLicense: {
    background: '#eaeef2',
    padding: '3px 8px',
    borderRadius: '4px',
    color: '#666',
  },
  mediaDate: {
    color: '#999',
  },
  mediaUploader: {
    fontSize: '0.9rem',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    maxWidth: '800px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalHeader: {
    padding: '20px',
    borderBottom: '1px solid #eaeef2',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: '1.5rem',
    color: '#0F3D2E',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '2rem',
    cursor: 'pointer',
    color: '#999',
    ':hover': {
      color: '#666',
    },
  },
  modalContent: {
    padding: '20px',
  },
  modalImage: {
    maxWidth: '100%',
    maxHeight: '400px',
    display: 'block',
    margin: '0 auto 20px',
  },
  modalFileInfo: {
    textAlign: 'center',
    padding: '40px',
    background: '#f8f9fa',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '1.1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  modalDetails: {
    marginBottom: '20px',
    '& p': {
      margin: '10px 0',
      fontSize: '1rem',
      color: '#333',
    },
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  downloadButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    background: '#4CAF50',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s',
    ':hover': {
      background: '#45a049',
    },
  },
  editButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    background: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s',
    ':hover': {
      background: '#1e88e5',
    },
  },
  deleteButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    background: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s',
    ':hover': {
      background: '#e53935',
    },
  },
};

export default WikiMediaGalleryPage;