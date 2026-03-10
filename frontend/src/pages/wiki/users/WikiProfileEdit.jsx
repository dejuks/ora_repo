// WikiProfileEdit.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../landing/components/Navbar";
import { 
  FaUserCircle, 
  FaSave, 
  FaTimes, 
  FaCamera,
  FaGlobe,
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaGraduationCap,
  FaBriefcase,
  FaMapMarkerAlt,
  FaLink,
  FaPen,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaPalette,
  FaHeart,
  FaBookOpen,
  FaLanguage
} from "react-icons/fa";

const WikiProfileEdit = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const [formData, setFormData] = useState({
    // Personal Info
    display_name: "",
    bio: "",
    location: "",
    website: "",
    occupation: "",
    education: "",
    
    // Professional
    expertise: "",
    interests: "",
    languages: "",
    
    // Social
    twitter: "",
    linkedin: "",
    github: "",
    
    // Preferences
    email_notifications: true,
    profile_visibility: "public",
    theme_preference: "light",
    
    // Stats
    reputation_points: 0,
    articles_count: 0,
    edits_count: 0,
    is_verified: false
  });

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/wiki/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch user profile
      const profileRes = await fetch('http://localhost:5000/api/wiki/profile/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.success) {
          setProfile(profileData.data);
          
          // Update form with profile data
          setFormData({
            display_name: profileData.data.display_name || "",
            bio: profileData.data.bio || "",
            location: profileData.data.location || "",
            website: profileData.data.website || "",
            occupation: profileData.data.occupation || "",
            education: profileData.data.education || "",
            expertise: profileData.data.expertise || "",
            interests: profileData.data.interests || "",
            languages: profileData.data.languages || "",
            twitter: profileData.data.twitter || "",
            linkedin: profileData.data.linkedin || "",
            github: profileData.data.github || "",
            email_notifications: profileData.data.email_notifications ?? true,
            profile_visibility: profileData.data.profile_visibility || "public",
            theme_preference: profileData.data.theme_preference || "light",
            reputation_points: profileData.data.reputation_points || 0,
            articles_count: profileData.data.articles_count || 0,
            edits_count: profileData.data.edits_count || 0,
            is_verified: profileData.data.is_verified || false
          });
          
          // Set avatar preview
          if (profileData.data.avatar_url) {
            setAvatarPreview(profileData.data.avatar_url);
          }
          
          // Set cover preview
          if (profileData.data.cover_url) {
            setCoverPreview(profileData.data.cover_url);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Avatar image must be less than 5MB");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Cover image must be less than 10MB");
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      // Append files if changed
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }
      if (coverFile) {
        formDataToSend.append('cover', coverFile);
      }

      const res = await fetch('http://localhost:5000/api/wiki/profile/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/wiki/dashboard');
        }, 2000);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    if (formData.display_name) {
      return formData.display_name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (user?.full_name) {
      return user.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.loadingContainer}>
          <FaSpinner style={styles.loadingSpinner} />
          <p>Loading your profile...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.headerTitle}>Edit Profile</h1>
            <p style={styles.headerSubtitle}>
              Customize your public profile and preferences
            </p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div style={styles.successMessage}>
            <FaCheckCircle />
            <span>Profile updated successfully! Redirecting...</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={styles.errorMessage}>
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Cover Image Section */}
          <div style={styles.coverSection}>
            <div style={styles.coverContainer}>
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" style={styles.coverImage} />
              ) : (
                <div style={styles.coverPlaceholder}>
                  <FaCamera style={styles.coverPlaceholderIcon} />
                  <p>Upload Cover Image</p>
                </div>
              )}
              <label htmlFor="cover-upload" style={styles.coverUploadBtn}>
                <FaCamera />
                <span>Change Cover</span>
              </label>
              <input
                type="file"
                id="cover-upload"
                accept="image/*"
                onChange={handleCoverChange}
                style={{ display: 'none' }}
              />
            </div>

            {/* Avatar Section */}
            <div style={styles.avatarWrapper}>
              <div style={styles.avatarContainer}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" style={styles.avatar} />
                ) : (
                  <div style={styles.avatarPlaceholder}>
                    {getInitials()}
                  </div>
                )}
                <label htmlFor="avatar-upload" style={styles.avatarUploadBtn}>
                  <FaCamera />
                </label>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div style={styles.tabsContainer}>
            <button
              type="button"
              style={{...styles.tab, ...(activeTab === 'personal' && styles.activeTab)}}
              onClick={() => setActiveTab('personal')}
            >
              <FaUserCircle /> Personal Info
            </button>
            <button
              type="button"
              style={{...styles.tab, ...(activeTab === 'professional' && styles.activeTab)}}
              onClick={() => setActiveTab('professional')}
            >
              <FaBriefcase /> Professional
            </button>
            <button
              type="button"
              style={{...styles.tab, ...(activeTab === 'social' && styles.activeTab)}}
              onClick={() => setActiveTab('social')}
            >
              <FaGlobe /> Social Links
            </button>
            <button
              type="button"
              style={{...styles.tab, ...(activeTab === 'preferences' && styles.activeTab)}}
              onClick={() => setActiveTab('preferences')}
            >
              <FaPalette /> Preferences
            </button>
          </div>

          {/* Tab Content */}
          <div style={styles.tabContent}>
            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <div style={styles.tabPanel}>
                <h3 style={styles.sectionTitle}>Personal Information</h3>
                
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <FaUserCircle style={styles.labelIcon} />
                      Display Name
                    </label>
                    <input
                      type="text"
                      name="display_name"
                      value={formData.display_name}
                      onChange={handleInputChange}
                      placeholder="How you want to be called"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <FaMapMarkerAlt style={styles.labelIcon} />
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City, Country"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.fullWidth}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        <FaPen style={styles.labelIcon} />
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself..."
                        rows="4"
                        style={styles.textarea}
                      />
                      <div style={styles.charCount}>
                        {formData.bio.length}/500
                      </div>
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <FaBriefcase style={styles.labelIcon} />
                      Occupation
                    </label>
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      placeholder="e.g., Researcher, Writer"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <FaGraduationCap style={styles.labelIcon} />
                      Education
                    </label>
                    <input
                      type="text"
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      placeholder="Your educational background"
                      style={styles.input}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Professional Tab */}
            {activeTab === 'professional' && (
              <div style={styles.tabPanel}>
                <h3 style={styles.sectionTitle}>Professional Information</h3>
                
                <div style={styles.formGrid}>
                  <div style={styles.fullWidth}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        <FaBookOpen style={styles.labelIcon} />
                        Areas of Expertise
                      </label>
                      <input
                        type="text"
                        name="expertise"
                        value={formData.expertise}
                        onChange={handleInputChange}
                        placeholder="e.g., History, Linguistics, Culture (comma separated)"
                        style={styles.input}
                      />
                      <small style={styles.hint}>Separate with commas</small>
                    </div>
                  </div>

                  <div style={styles.fullWidth}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        <FaHeart style={styles.labelIcon} />
                        Research Interests
                      </label>
                      <textarea
                        name="interests"
                        value={formData.interests}
                        onChange={handleInputChange}
                        placeholder="What topics are you passionate about?"
                        rows="3"
                        style={styles.textarea}
                      />
                    </div>
                  </div>

                  <div style={styles.fullWidth}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        <FaLanguage style={styles.labelIcon} />
                        Languages
                      </label>
                      <input
                        type="text"
                        name="languages"
                        value={formData.languages}
                        onChange={handleInputChange}
                        placeholder="e.g., Afaan Oromo, English, Amharic (comma separated)"
                        style={styles.input}
                      />
                      <small style={styles.hint}>Languages you speak or write in</small>
                    </div>
                  </div>
                </div>

                {/* Stats Preview */}
                <div style={styles.statsPreview}>
                  <h4 style={styles.statsTitle}>Your Contribution Stats</h4>
                  <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                      <span style={styles.statValue}>{formData.articles_count}</span>
                      <span style={styles.statLabel}>Articles</span>
                    </div>
                    <div style={styles.statCard}>
                      <span style={styles.statValue}>{formData.edits_count}</span>
                      <span style={styles.statLabel}>Edits</span>
                    </div>
                    <div style={styles.statCard}>
                      <span style={styles.statValue}>{formData.reputation_points}</span>
                      <span style={styles.statLabel}>Reputation</span>
                    </div>
                    {formData.is_verified && (
                      <div style={styles.verifiedBadge}>
                        <FaCheckCircle /> Verified Contributor
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Social Links Tab */}
            {activeTab === 'social' && (
              <div style={styles.tabPanel}>
                <h3 style={styles.sectionTitle}>Social Media Links</h3>
                
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <FaGlobe style={styles.labelIcon} />
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://yourwebsite.com"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <FaTwitter style={{...styles.labelIcon, color: '#1DA1F2'}} />
                      Twitter
                    </label>
                    <input
                      type="text"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleInputChange}
                      placeholder="@username"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <FaLinkedin style={{...styles.labelIcon, color: '#0077B5'}} />
                      LinkedIn
                    </label>
                    <input
                      type="text"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      placeholder="LinkedIn profile URL"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <FaGithub style={styles.labelIcon} />
                      GitHub
                    </label>
                    <input
                      type="text"
                      name="github"
                      value={formData.github}
                      onChange={handleInputChange}
                      placeholder="GitHub username"
                      style={styles.input}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div style={styles.tabPanel}>
                <h3 style={styles.sectionTitle}>Account Preferences</h3>
                
                <div style={styles.formGrid}>
                  <div style={styles.fullWidth}>
                    <div style={styles.preferenceItem}>
                      <div style={styles.preferenceInfo}>
                        <h4 style={styles.preferenceTitle}>Email Notifications</h4>
                        <p style={styles.preferenceDesc}>
                          Receive email updates about your articles and contributions
                        </p>
                      </div>
                      <label style={styles.switch}>
                        <input
                          type="checkbox"
                          name="email_notifications"
                          checked={formData.email_notifications}
                          onChange={handleInputChange}
                        />
                        <span style={styles.slider}></span>
                      </label>
                    </div>
                  </div>

                  <div style={styles.fullWidth}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Profile Visibility</label>
                      <select
                        name="profile_visibility"
                        value={formData.profile_visibility}
                        onChange={handleInputChange}
                        style={styles.select}
                      >
                        <option value="public">Public - Everyone can see</option>
                        <option value="private">Private - Only logged in users</option>
                        <option value="hidden">Hidden - Only you</option>
                      </select>
                    </div>
                  </div>

                  <div style={styles.fullWidth}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Theme Preference</label>
                      <select
                        name="theme_preference"
                        value={formData.theme_preference}
                        onChange={handleInputChange}
                        style={styles.select}
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System Default</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={styles.actions}>
            <button
              type="button"
              onClick={() => navigate('/wiki/dashboard')}
              style={styles.cancelButton}
            >
              <FaTimes /> Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                ...styles.saveButton,
                ...(saving && styles.savingButton)
              }}
            >
              {saving ? (
                <>
                  <FaSpinner style={styles.spinning} /> Saving...
                </>
              ) : (
                <>
                  <FaSave /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    fontFamily: "'Inter', 'Poppins', sans-serif",
    padding: "40px 20px",
  },
  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
  },
  loadingSpinner: {
    fontSize: "3rem",
    animation: "spin 1s linear infinite",
    marginBottom: "20px",
  },
  header: {
    maxWidth: "1000px",
    margin: "0 auto 30px",
    color: "white",
  },
  headerContent: {
    textAlign: "center",
  },
  headerTitle: {
    fontSize: "2.5rem",
    margin: "0 0 10px",
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: "1.1rem",
    opacity: 0.9,
    margin: 0,
  },
  successMessage: {
    maxWidth: "1000px",
    margin: "0 auto 20px",
    padding: "15px 20px",
    background: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
    borderRadius: "10px",
    color: "#0F3D2E",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "1rem",
    fontWeight: "500",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  },
  errorMessage: {
    maxWidth: "1000px",
    margin: "0 auto 20px",
    padding: "15px 20px",
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    borderRadius: "10px",
    color: "white",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "1rem",
    fontWeight: "500",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  },
  form: {
    maxWidth: "1000px",
    margin: "0 auto",
    background: "white",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  coverSection: {
    position: "relative",
    height: "250px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  coverContainer: {
    position: "relative",
    height: "100%",
    overflow: "hidden",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  coverPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
  },
  coverPlaceholderIcon: {
    fontSize: "4rem",
    marginBottom: "10px",
    opacity: 0.5,
  },
  coverUploadBtn: {
    position: "absolute",
    bottom: "20px",
    right: "20px",
    background: "rgba(255,255,255,0.2)",
    backdropFilter: "blur(10px)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "30px",
    padding: "10px 20px",
    fontSize: "0.9rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease",
    ":hover": {
      background: "rgba(255,255,255,0.3)",
    },
  },
  avatarWrapper: {
    position: "absolute",
    bottom: "0",
    left: "40px",
    transform: "translateY(50%)",
  },
  avatarContainer: {
    position: "relative",
    width: "120px",
    height: "120px",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    border: "4px solid white",
    objectFit: "cover",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    border: "4px solid white",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "3rem",
    fontWeight: "600",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
  },
  avatarUploadBtn: {
    position: "absolute",
    bottom: "0",
    right: "0",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#C9A227",
    color: "white",
    border: "3px solid white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    ":hover": {
      transform: "scale(1.1)",
      background: "#b88c1f",
    },
  },
  tabsContainer: {
    display: "flex",
    padding: "60px 30px 0",
    gap: "10px",
    borderBottom: "2px solid #eaeef2",
  },
  tab: {
    padding: "12px 24px",
    background: "transparent",
    border: "none",
    borderRadius: "30px 30px 0 0",
    fontSize: "1rem",
    fontWeight: "500",
    color: "#666",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease",
    ":hover": {
      color: "#C9A227",
      background: "rgba(201,162,39,0.1)",
    },
  },
  activeTab: {
    color: "#C9A227",
    background: "rgba(201,162,39,0.1)",
    borderBottom: "3px solid #C9A227",
  },
  tabContent: {
    padding: "30px",
  },
  tabPanel: {
    animation: "fadeIn 0.5s ease",
  },
  sectionTitle: {
    fontSize: "1.3rem",
    color: "#0F3D2E",
    margin: "0 0 20px",
    paddingBottom: "10px",
    borderBottom: "2px solid #eaeef2",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
  },
  fullWidth: {
    gridColumn: "span 2",
  },
  formGroup: {
    marginBottom: "5px",
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#555",
    marginBottom: "8px",
  },
  labelIcon: {
    fontSize: "1rem",
    color: "#C9A227",
  },
  input: {
    width: "100%",
    padding: "12px 15px",
    border: "2px solid #eaeef2",
    borderRadius: "10px",
    fontSize: "0.95rem",
    transition: "all 0.3s ease",
    outline: "none",
    ":focus": {
      borderColor: "#C9A227",
      boxShadow: "0 0 0 3px rgba(201,162,39,0.1)",
    },
  },
  textarea: {
    width: "100%",
    padding: "12px 15px",
    border: "2px solid #eaeef2",
    borderRadius: "10px",
    fontSize: "0.95rem",
    fontFamily: "inherit",
    resize: "vertical",
    transition: "all 0.3s ease",
    outline: "none",
    ":focus": {
      borderColor: "#C9A227",
      boxShadow: "0 0 0 3px rgba(201,162,39,0.1)",
    },
  },
  charCount: {
    textAlign: "right",
    fontSize: "0.8rem",
    color: "#999",
    marginTop: "5px",
  },
  hint: {
    display: "block",
    fontSize: "0.8rem",
    color: "#999",
    marginTop: "5px",
  },
  select: {
    width: "100%",
    padding: "12px 15px",
    border: "2px solid #eaeef2",
    borderRadius: "10px",
    fontSize: "0.95rem",
    background: "white",
    cursor: "pointer",
    outline: "none",
    ":focus": {
      borderColor: "#C9A227",
    },
  },
  statsPreview: {
    marginTop: "30px",
    padding: "20px",
    background: "#f8f9fa",
    borderRadius: "15px",
  },
  statsTitle: {
    fontSize: "1.1rem",
    color: "#0F3D2E",
    margin: "0 0 15px",
  },
  statsGrid: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  statCard: {
    textAlign: "center",
    minWidth: "100px",
    padding: "15px",
    background: "white",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  statValue: {
    display: "block",
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#C9A227",
    marginBottom: "5px",
  },
  statLabel: {
    fontSize: "0.85rem",
    color: "#666",
  },
  verifiedBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 15px",
    background: "rgba(76, 175, 80, 0.1)",
    color: "#4CAF50",
    borderRadius: "30px",
    fontSize: "0.95rem",
    fontWeight: "500",
  },
  preferenceItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px",
    background: "#f8f9fa",
    borderRadius: "10px",
  },
  preferenceInfo: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: "1rem",
    color: "#0F3D2E",
    margin: "0 0 5px",
  },
  preferenceDesc: {
    fontSize: "0.85rem",
    color: "#666",
    margin: 0,
  },
  switch: {
    position: "relative",
    display: "inline-block",
    width: "60px",
    height: "34px",
  },
  slider: {
    position: "absolute",
    cursor: "pointer",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#ccc",
    transition: ".4s",
    borderRadius: "34px",
    ":before": {
      position: "absolute",
      content: '""',
      height: "26px",
      width: "26px",
      left: "4px",
      bottom: "4px",
      backgroundColor: "white",
      transition: ".4s",
      borderRadius: "50%",
    },
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "15px",
    padding: "20px 30px 30px",
    borderTop: "2px solid #eaeef2",
  },
  cancelButton: {
    padding: "12px 24px",
    background: "transparent",
    border: "2px solid #eaeef2",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#666",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease",
    ":hover": {
      background: "#f8f9fa",
      borderColor: "#999",
    },
  },
  saveButton: {
    padding: "12px 30px",
    background: "linear-gradient(135deg, #C9A227, #b88c1f)",
    border: "none",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#0F3D2E",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 10px 25px rgba(201,162,39,0.3)",
    },
  },
  savingButton: {
    opacity: 0.7,
    cursor: "not-allowed",
    ":hover": {
      transform: "none",
    },
  },
  spinning: {
    animation: "spin 1s linear infinite",
  },
};

// Add global animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  input:checked + .slider {
    background-color: #C9A227;
  }
  
  input:checked + .slider:before {
    transform: translateX(26px);
  }
`;
document.head.appendChild(styleSheet);

export default WikiProfileEdit;