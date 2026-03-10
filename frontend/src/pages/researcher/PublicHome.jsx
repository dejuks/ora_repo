import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FaSearch, 
  FaUserPlus, 
  FaGraduationCap, 
  FaChartLine, 
  FaPaperPlane,
  FaGlobe,
  FaBuilding,
  FaUniversity,
  FaMicroscope,
  FaFlask,
  FaStethoscope,
  FaLaptopCode,
  FaSeedling,
  FaBookOpen,
  FaQuoteLeft,
  FaAward,
  FaCalendarAlt,
  FaLinkedin,
  FaTwitter,
  FaEnvelope,
  FaArrowRight,
  FaFilter,
  FaHeart,
  FaShareAlt,
  FaDownload,
  FaSpinner,
  FaExclamationCircle,
  FaUsers,
  FaRegClock,
  FaMapMarkerAlt,
  FaExternalLinkAlt
} from "react-icons/fa";
import Navbar from "../../landing/components/Navbar";
import { researcherAPI } from "../../api/researcher.api";

export default function ModernPublicHome() {
  // State management
  const [featuredResearchers, setFeaturedResearchers] = useState([]);
  const [recentPublications, setRecentPublications] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [researchFields, setResearchFields] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [networkStats, setNetworkStats] = useState(null);
  const [loading, setLoading] = useState({
    researchers: true,
    publications: true,
    events: true,
    fields: true,
    testimonials: true,
    stats: true
  });
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState(null);

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const fetchAllData = async () => {
    try {
      setError(null);
      
      // Fetch all data in parallel
      const [
        featuredRes,
        publicationsRes,
        eventsRes,
        fieldsRes,
        testimonialsRes,
        statsRes
      ] = await Promise.allSettled([
        researcherAPI.getFeaturedResearchers(3),
        researcherAPI.getRecentPublications(3),
        researcherAPI.getUpcomingEvents(3),
        researcherAPI.getResearchFields(),
        researcherAPI.getTestimonials(3),
        researcherAPI.getNetworkStats()
      ]);

      // Handle featured researchers
      if (featuredRes.status === 'fulfilled' && featuredRes.value?.success) {
        setFeaturedResearchers(featuredRes.value.data || []);
      }
      setLoading(prev => ({ ...prev, researchers: false }));

      // Handle recent publications
      if (publicationsRes.status === 'fulfilled' && publicationsRes.value?.success) {
        setRecentPublications(publicationsRes.value.data || []);
      }
      setLoading(prev => ({ ...prev, publications: false }));

      // Handle upcoming events
      if (eventsRes.status === 'fulfilled' && eventsRes.value?.success) {
        setUpcomingEvents(eventsRes.value.data || []);
      }
      setLoading(prev => ({ ...prev, events: false }));

      // Handle research fields
      if (fieldsRes.status === 'fulfilled' && fieldsRes.value?.success) {
        setResearchFields(fieldsRes.value.data || []);
      }
      setLoading(prev => ({ ...prev, fields: false }));

      // Handle testimonials
      if (testimonialsRes.status === 'fulfilled' && testimonialsRes.value?.success) {
        setTestimonials(testimonialsRes.value.data || []);
      }
      setLoading(prev => ({ ...prev, testimonials: false }));

      // Handle network stats
      if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
        setNetworkStats(statsRes.value.data || {});
      }
      setLoading(prev => ({ ...prev, stats: false }));

    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please refresh the page.");
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await researcherAPI.searchResearchers(searchQuery, { limit: 5 });
      if (response?.success) {
        setSearchResults(response.data || []);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    setNewsletterStatus('loading');
    try {
      const response = await researcherAPI.subscribeNewsletter(newsletterEmail);
      if (response?.success) {
        setNewsletterStatus('success');
        setNewsletterEmail('');
        setTimeout(() => setNewsletterStatus(null), 3000);
      }
    } catch (error) {
      setNewsletterStatus('error');
      setTimeout(() => setNewsletterStatus(null), 3000);
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getFieldIcon = (fieldName) => {
    const icons = {
      'Biomedical Sciences': <FaMicroscope />,
      'Computer Science': <FaLaptopCode />,
      'Public Health': <FaStethoscope />,
      'Agricultural Sciences': <FaSeedling />,
      'Engineering': <FaFlask />,
      'Social Sciences': <FaBookOpen />
    };
    return icons[fieldName] || <FaMicroscope />;
  };

  // Loading state
  const isLoading = Object.values(loading).some(state => state);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div style={styles.loadingContainer}>
          <FaSpinner className="spinner" size={40} />
          <p>Loading researcher network...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div style={styles.errorContainer}>
          <FaExclamationCircle size={40} color="#dc3545" />
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button onClick={fetchAllData} style={styles.retryButton}>
            Try Again
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="modern-researcher-network">
        {/* NAVBAR */}
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm fixed-top">
          <div className="container">
            <Link className="navbar-brand fw-bold text-primary d-flex align-items-center" to="/">
              <FaGraduationCap className="me-2" />
              <span>Oromo Research Network</span>
            </Link>
            
            <div className="d-flex align-items-center ms-auto">
              <div className="input-group input-group-sm me-3 position-relative" style={{ width: "300px" }}>
                <span className="input-group-text bg-transparent border-end-0">
                  <FaSearch className="text-muted" />
                </span>
                <input 
                  type="text" 
                  className="form-control border-start-0" 
                  placeholder="Search researchers, publications, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {isSearching && (
                  <div style={styles.searchSpinner}>
                    <FaSpinner className="spinner" />
                  </div>
                )}
                {searchResults.length > 0 && searchQuery && (
                  <div style={styles.searchDropdown}>
                    {searchResults.map(researcher => (
                      <Link 
                        key={researcher.id}
                        to={`/researcher/${researcher.id}`}
                        style={styles.searchItem}
                      >
                        <img 
                          src={researcher.profileImg || `https://i.pravatar.cc/40?u=${researcher.id}`}
                          alt={researcher.name}
                          style={styles.searchItemImage}
                        />
                        <div>
                          <div style={styles.searchItemName}>{researcher.name}</div>
                          <small style={styles.searchItemAffiliation}>{researcher.affiliation}</small>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              
              <Link to="/researcher/login" className="btn btn-outline-primary btn-sm me-2">Sign In</Link>
              <Link to="/researcher/register" className="btn btn-primary btn-sm">
                <FaUserPlus className="me-1" /> Join Free
              </Link>
            </div>
          </div>
        </nav>

        {/* HERO SECTION */}
        <section className="hero-section pt-5 mt-5">
          <div className="container pt-5">
            <div className="row align-items-center min-vh-75">
              <div className="col-lg-6">
                <div className="hero-content">
                  <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 mb-3 rounded-pill">
                    <FaGlobe className="me-2" /> Global Community
                  </span>
                  <h1 className="display-4 fw-bold mb-4">
                    Connect with <span className="text-gradient">Oromo Researchers</span> Worldwide
                  </h1>
                  <p className="lead text-muted mb-4">
                    Join {formatNumber(networkStats?.totalResearchers || 2500)}+ academics, scientists, and innovators. 
                    Share your research, find collaborators, and advance your career.
                  </p>
                  
                  <div className="d-flex flex-wrap gap-3 mb-4">
                    <Link to="/researcher/register" className="btn btn-primary btn-lg px-4">
                      Create Profile <FaArrowRight className="ms-2" />
                    </Link>
                    <Link to="/discover" className="btn btn-outline-primary btn-lg px-4">
                      <FaSearch className="me-2" /> Explore Research
                    </Link>
                  </div>
                  
                  <div className="d-flex align-items-center text-muted">
                    <div className="d-flex me-4">
                      {featuredResearchers.slice(0, 4).map((researcher, index) => (
                        <div 
                          key={researcher.id}
                          className="border border-2 border-white rounded-circle"
                          style={{
                            width: 40,
                            height: 40,
                            marginLeft: index > 0 ? -10 : 0,
                            backgroundImage: `url(${researcher.profileImg || `https://i.pravatar.cc/40?u=${researcher.id}`})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        />
                      ))}
                    </div>
                    <div>
                      <span className="fw-bold text-dark">{formatNumber(networkStats?.totalResearchers || 2500)}+</span> researchers from 
                      <span className="fw-bold text-dark ms-1">{networkStats?.totalCountries || 45}+</span> countries
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-6">
                <div className="hero-image position-relative">
                  {featuredResearchers.slice(0, 2).map((researcher, index) => (
                    <div 
                      key={researcher.id}
                      className="floating-card card border-0 shadow-lg" 
                      style={{ 
                        position: 'absolute', 
                        top: index === 0 ? '-20px' : '50px',
                        right: index === 0 ? '100px' : 'auto',
                        left: index === 1 ? '20px' : 'auto',
                        bottom: index === 1 ? '50px' : 'auto',
                        width: '280px',
                        zIndex: 2,
                        animation: `float 3s ease-in-out infinite`,
                        animationDelay: `${index * 0.5}s`
                      }}
                    >
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <div className="avatar-sm me-3">
                            <img 
                              src={researcher.profileImg || `https://i.pravatar.cc/40?u=${researcher.id}`}
                              className="rounded-circle"
                              alt={researcher.name}
                              width="40"
                              height="40"
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                          <div>
                            <h6 className="mb-0 fw-bold">{researcher.name}</h6>
                            <small className="text-muted">Published new research</small>
                          </div>
                        </div>
                        <p className="small mb-2">
                          "{researcher.latestPublication?.substring(0, 60)}..."
                        </p>
                        <div className="d-flex justify-content-between">
                          <span className="badge bg-light text-dark">
                            {researcher.researchAreas?.[0] || 'Research'}
                          </span>
                          <small className="text-muted">{formatDate(researcher.lastActive)}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <img 
                    src="/oromo-research-network.png"
                    alt="Research Collaboration"
                    className="img-fluid rounded-3 shadow-lg"
                    style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED RESEARCHERS */}
        <section className="py-5 bg-light">
          <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-5">
              <div>
                <h2 className="fw-bold mb-2">Featured Researchers</h2>
                <p className="text-muted">Connect with leading Oromo academics</p>
              </div>
              <Link to="/researchers" className="btn btn-outline-primary">
                View All <FaArrowRight className="ms-2" />
              </Link>
            </div>
            
            <div className="row g-4">
              {featuredResearchers.map(researcher => (
                <div key={researcher.id} className="col-lg-4 col-md-6">
                  <div className="card researcher-card border-0 shadow-sm h-100">
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="position-relative">
                          <img 
                            src={researcher.profileImg || `https://i.pravatar.cc/80?u=${researcher.id}`}
                            alt={researcher.name}
                            className="rounded-circle mb-3"
                            width="80"
                            height="80"
                            style={{ objectFit: 'cover' }}
                          />
                          {researcher.isOnline && (
                            <span className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white"
                              style={{ width: 15, height: 15 }}
                            />
                          )}
                        </div>
                        <span className="badge bg-primary bg-opacity-10 text-primary">
                          {researcher.badge || 'Featured'}
                        </span>
                      </div>
                      
                      <h5 className="fw-bold mb-1">{researcher.name}</h5>
                      <p className="text-primary mb-2">{researcher.title}</p>
                      <div className="mb-3">
                        <div className="d-flex align-items-center text-muted small mb-1">
                          <FaUniversity className="me-2" />
                          {researcher.affiliation}
                        </div>
                        <div className="text-muted small">
                          {researcher.department}
                        </div>
                      </div>
                      
                      <div className="d-flex gap-4 mb-3">
                        <div className="text-center">
                          <div className="fw-bold text-primary">{formatNumber(researcher.citations)}</div>
                          <small className="text-muted">Citations</small>
                        </div>
                        <div className="text-center">
                          <div className="fw-bold text-primary">{researcher.publications}</div>
                          <small className="text-muted">Publications</small>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        {researcher.researchAreas?.map((area, idx) => (
                          <span key={idx} className="badge bg-light text-dark me-1 mb-1">
                            {area}
                          </span>
                        ))}
                      </div>
                      
                      <div className="d-flex gap-2">
                        <Link 
                          to={`/researcher/connect/${researcher.id}`} 
                          className="btn btn-sm btn-outline-primary flex-fill"
                        >
                          <FaPaperPlane className="me-1" /> Connect
                        </Link>
                        <Link 
                          to={`/researcher/${researcher.id}`} 
                          className="btn btn-sm btn-primary flex-fill"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RESEARCH FIELDS */}
        <section className="py-5">
          <div className="container py-5">
            <div className="text-center mb-5">
              <h2 className="fw-bold mb-3">Explore Research Fields</h2>
              <p className="text-muted">Find collaborators in your area of expertise</p>
            </div>
            
            <div className="row g-4">
              {researchFields.map((field, idx) => (
                <div key={idx} className="col-lg-2 col-md-4 col-6">
                  <Link to={`/research-field/${field.id}`} style={{ textDecoration: 'none' }}>
                    <div className="field-card card border-0 text-center p-4 h-100 hover-lift">
                      <div className="icon-wrapper bg-primary bg-opacity-10 text-primary rounded-circle mb-3 mx-auto"
                        style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {getFieldIcon(field.name)}
                      </div>
                      <h6 className="fw-bold mb-1">{field.name}</h6>
                      <small className="text-muted">{formatNumber(field.count)} researchers</small>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PUBLICATIONS */}
        <section className="py-5 bg-light">
          <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-5">
              <div>
                <h2 className="fw-bold mb-2">Recent Publications</h2>
                <p className="text-muted">Latest research from the community</p>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-primary btn-sm">
                  <FaFilter className="me-1" /> Filter
                </button>
                <Link to="/publications" className="btn btn-primary btn-sm">
                  View All
                </Link>
              </div>
            </div>
            
            <div className="row g-4">
              {recentPublications.map(pub => (
                <div key={pub.id} className="col-lg-4 col-md-6">
                  <div className="card publication-card border-0 shadow-sm h-100">
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <span className={`badge ${pub.access === 'Open Access' ? 'bg-success' : 'bg-warning'}`}>
                          {pub.access}
                        </span>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-light">
                            <FaHeart className="text-muted" />
                          </button>
                          <button className="btn btn-sm btn-light">
                            <FaShareAlt className="text-muted" />
                          </button>
                        </div>
                      </div>
                      
                      <h5 className="fw-bold mb-3">
                        <Link to={`/publication/${pub.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {pub.title}
                        </Link>
                      </h5>
                      
                      <div className="mb-3">
                        <small className="text-muted">Authors: </small>
                        <small>{pub.authors?.join(', ')}</small>
                      </div>
                      
                      <div className="mb-3">
                        <div className="d-flex align-items-center text-muted small mb-1">
                          <FaBookOpen className="me-2" />
                          {pub.journal} • {pub.year}
                        </div>
                        <div className="text-muted small">
                          DOI: {pub.doi}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        {pub.tags?.map((tag, idx) => (
                          <span key={idx} className="badge bg-light text-dark me-1 mb-1">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex gap-3">
                          <div className="text-center">
                            <div className="fw-bold text-primary">{pub.citations}</div>
                            <small className="text-muted">Citations</small>
                          </div>
                          <div className="text-center">
                            <div className="fw-bold text-primary">{pub.downloads}</div>
                            <small className="text-muted">Downloads</small>
                          </div>
                        </div>
                        
                        {pub.pdfUrl && (
                          <a 
                            href={pub.pdfUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="btn btn-primary btn-sm"
                          >
                            <FaDownload className="me-1" /> PDF
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* UPCOMING EVENTS */}
        <section className="py-5">
          <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-5">
              <div>
                <h2 className="fw-bold mb-2">Upcoming Events</h2>
                <p className="text-muted">Conferences, workshops, and seminars</p>
              </div>
              <Link to="/events" className="btn btn-outline-primary">
                <FaCalendarAlt className="me-2" /> All Events
              </Link>
            </div>
            
            <div className="row g-4">
              {upcomingEvents.map(event => (
                <div key={event.id} className="col-lg-4 col-md-6">
                  <div className="card event-card border-0 shadow-sm h-100">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-start mb-3">
                        <div className="date-box bg-primary text-white text-center p-3 me-3 rounded-2">
                          <div className="fw-bold fs-5">
                            {new Date(event.date).getDate()}
                          </div>
                          <small>
                            {new Date(event.date).toLocaleString('default', { month: 'short' })}
                          </small>
                        </div>
                        <div>
                          <h5 className="fw-bold mb-1">{event.title}</h5>
                          <div className="text-muted small">
                            <FaCalendarAlt className="me-1" /> {event.date}
                          </div>
                          <div className="text-muted small">
                            <FaMapMarkerAlt className="me-1" /> {event.location}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-muted mb-4">{event.description}</p>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex gap-3">
                          <div className="text-center">
                            <div className="fw-bold">{event.speakers}</div>
                            <small className="text-muted">Speakers</small>
                          </div>
                          <div className="text-center">
                            <div className="fw-bold">{event.attendees}</div>
                            <small className="text-muted">Attendees</small>
                          </div>
                        </div>
                        
                        <Link to={`/event/${event.id}`} className="btn btn-primary btn-sm">
                          Register
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-5 bg-primary text-white">
          <div className="container py-5">
            <div className="text-center mb-5">
              <h2 className="fw-bold mb-3">What Researchers Say</h2>
              <p className="text-white-75">Join thousands of satisfied academics</p>
            </div>
            
            <div className="row g-4">
              {testimonials.map((testimonial, idx) => (
                <div key={idx} className="col-lg-4">
                  <div className="card bg-white bg-opacity-10 border-0 h-100">
                    <div className="card-body p-4">
                      <FaQuoteLeft className="mb-3 opacity-50" size={24} />
                      <p className="mb-4">"{testimonial.text}"</p>
                      <div>
                        <h6 className="fw-bold mb-1">{testimonial.author}</h6>
                        <small className="text-white-75">{testimonial.role}</small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-5">
          <div className="container py-5">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <div className="card border-0 shadow-lg">
                  <div className="card-body p-5">
                    <FaAward className="display-1 text-primary mb-4" />
                    <h2 className="fw-bold mb-3">Start Your Research Journey</h2>
                    <p className="text-muted mb-4">
                      Join the fastest growing network of Oromo researchers. 
                      Share knowledge, find collaborators, and accelerate your career.
                    </p>
                    
                    <div className="d-flex flex-wrap gap-3 justify-content-center">
                      <Link to="/researcher/register" className="btn btn-primary btn-lg px-5">
                        Create Free Profile
                      </Link>
                      <Link to="/discover" className="btn btn-outline-primary btn-lg px-5">
                        Explore Network
                      </Link>
                    </div>
                    
                    <div className="mt-4 text-muted small">
                      No credit card required • Takes 2 minutes
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NEWSLETTER */}
        <section className="py-5 bg-light">
          <div className="container py-5">
            <div className="row justify-content-center">
              <div className="col-lg-6 text-center">
                <h3 className="fw-bold mb-3">Stay Updated</h3>
                <p className="text-muted mb-4">
                  Get the latest research, opportunities, and network updates
                </p>
                
                <form onSubmit={handleNewsletterSubmit}>
                  <div className="input-group">
                    <input 
                      type="email" 
                      className="form-control" 
                      placeholder="Enter your email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      required
                    />
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={newsletterStatus === 'loading'}
                    >
                      {newsletterStatus === 'loading' ? (
                        <FaSpinner className="spinner" />
                      ) : (
                        'Subscribe'
                      )}
                    </button>
                  </div>
                  
                  {newsletterStatus === 'success' && (
                    <div className="alert alert-success mt-3">
                      Successfully subscribed!
                    </div>
                  )}
                  
                  {newsletterStatus === 'error' && (
                    <div className="alert alert-danger mt-3">
                      Subscription failed. Please try again.
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-dark text-white py-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-4 mb-4">
                <div className="d-flex align-items-center mb-3">
                  <FaGraduationCap className="fs-2 text-primary me-2" />
                  <h4 className="fw-bold mb-0">Oromo Research Network</h4>
                </div>
                <p className="text-white-75 mb-4">
                  Empowering Oromo researchers worldwide through collaboration, 
                  knowledge sharing, and professional growth.
                </p>
                <div className="d-flex gap-3">
                  <a href="#" className="text-white-75"><FaLinkedin /></a>
                  <a href="#" className="text-white-75"><FaTwitter /></a>
                  <a href="#" className="text-white-75"><FaEnvelope /></a>
                </div>
              </div>
              
              <div className="col-lg-2 col-md-4 mb-4">
                <h6 className="fw-bold mb-3">Platform</h6>
                <ul className="list-unstyled">
                  <li className="mb-2"><Link to="/discover" className="text-white-75 text-decoration-none">Discover</Link></li>
                  <li className="mb-2"><Link to="/publications" className="text-white-75 text-decoration-none">Publications</Link></li>
                  <li className="mb-2"><Link to="/events" className="text-white-75 text-decoration-none">Events</Link></li>
                  <li className="mb-2"><Link to="/jobs" className="text-white-75 text-decoration-none">Jobs</Link></li>
                  <li><Link to="/funding" className="text-white-75 text-decoration-none">Funding</Link></li>
                </ul>
              </div>
              
              <div className="col-lg-2 col-md-4 mb-4">
                <h6 className="fw-bold mb-3">Company</h6>
                <ul className="list-unstyled">
                  <li className="mb-2"><Link to="/about" className="text-white-75 text-decoration-none">About</Link></li>
                  <li className="mb-2"><Link to="/team" className="text-white-75 text-decoration-none">Team</Link></li>
                  <li className="mb-2"><Link to="/careers" className="text-white-75 text-decoration-none">Careers</Link></li>
                  <li className="mb-2"><Link to="/blog" className="text-white-75 text-decoration-none">Blog</Link></li>
                  <li><Link to="/contact" className="text-white-75 text-decoration-none">Contact</Link></li>
                </ul>
              </div>
              
              <div className="col-lg-4 col-md-4 mb-4">
                <h6 className="fw-bold mb-3">Stay Updated</h6>
                <p className="text-white-75 small mb-3">
                  Subscribe to our newsletter for the latest research and opportunities.
                </p>
                <form onSubmit={handleNewsletterSubmit}>
                  <div className="input-group">
                    <input 
                      type="email" 
                      className="form-control" 
                      placeholder="Your email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                    />
                    <button className="btn btn-primary" type="submit">Subscribe</button>
                  </div>
                </form>
              </div>
            </div>
            
            <hr className="text-white-50 my-4" />
            
            <div className="row">
              <div className="col-md-6">
                <p className="text-white-75 small mb-0">
                  © {new Date().getFullYear()} Oromo Research Network. All rights reserved.
                </p>
              </div>
              <div className="col-md-6 text-md-end">
                <Link to="/privacy" className="text-white-75 small text-decoration-none me-3">Privacy Policy</Link>
                <Link to="/terms" className="text-white-75 small text-decoration-none me-3">Terms of Service</Link>
                <Link to="/cookies" className="text-white-75 small text-decoration-none">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </footer>

        <style jsx>{`
          .modern-researcher-network {
            --bs-primary: #2563eb;
            --bs-primary-rgb: 37, 99, 235;
          }
          
          .hero-section {
            padding-top: 100px;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            overflow: hidden;
          }
          
          .text-gradient {
            background: linear-gradient(135deg, var(--bs-primary) 0%, #7c3aed 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .floating-card {
            animation: float 3s ease-in-out infinite;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .spinner {
            animation: spin 1s linear infinite;
          }
          
          .hover-lift {
            transition: all 0.3s ease;
          }
          
          .hover-lift:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
          }
          
          .researcher-card, .publication-card, .event-card, .field-card {
            transition: all 0.3s ease;
          }
          
          .researcher-card:hover, .publication-card:hover, .event-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
          }
          
          .field-card:hover .icon-wrapper {
            background: var(--bs-primary) !important;
            color: white !important;
            transform: scale(1.1);
          }
          
          .date-box {
            min-width: 60px;
          }
          
          .avatar-sm img {
            width: 40px;
            height: 40px;
            object-fit: cover;
          }
          
          /* Custom scrollbar */
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          
          ::-webkit-scrollbar-thumb {
            background: var(--bs-primary);
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: #1d4ed8;
          }
          
          @media (max-width: 768px) {
            .hero-section {
              text-align: center;
              padding-top: 80px;
            }
            
            .display-4 {
              font-size: 2.5rem;
            }
            
            .floating-card {
              position: relative !important;
              margin: 20px auto;
              width: 100% !important;
            }
          }
        `}</style>
      </div>
    </>
  );
}

// Styles for additional components
const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '20px',
    padding: '20px',
    textAlign: 'center'
  },
  retryButton: {
    padding: '10px 30px',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  searchSpinner: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6c757d'
  },
  searchDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: 'white',
    border: '1px solid #eaeef2',
    borderRadius: '5px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    zIndex: 1000,
    maxHeight: '300px',
    overflowY: 'auto'
  },
  searchItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    textDecoration: 'none',
    color: 'inherit',
    borderBottom: '1px solid #eaeef2',
    transition: 'background 0.3s ease'
  },
  searchItemImage: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  searchItemName: {
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  searchItemAffiliation: {
    fontSize: '0.8rem',
    color: '#6c757d'
  }
}; 