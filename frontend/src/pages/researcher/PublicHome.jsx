import React from "react";
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
  FaDownload
} from "react-icons/fa";

const featuredResearchers = [
  {
    id: 1,
    name: "Dr. Abdi Oromo",
    title: "AI & Machine Learning Researcher",
    affiliation: "Stanford University",
    department: "Computer Science",
    profileImg: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    citations: 1245,
    publications: 42,
    researchAreas: ["AI Ethics", "ML Systems", "NLP"],
    isOnline: true,
    badge: "Featured"
  },
  {
    id: 2,
    name: "Dr. Amina Farah",
    title: "Public Health Epidemiologist",
    affiliation: "Johns Hopkins University",
    department: "Bloomberg School of Public Health",
    profileImg: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop",
    citations: 892,
    publications: 31,
    researchAreas: ["Global Health", "Epidemiology", "Health Equity"],
    isOnline: false,
    badge: "Top Contributor"
  },
  {
    id: 3,
    name: "Dr. Hassan Mohamed",
    title: "Climate Scientist",
    affiliation: "MIT",
    department: "Earth & Planetary Sciences",
    profileImg: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w-400&h=400&fit=crop",
    citations: 1567,
    publications: 56,
    researchAreas: ["Climate Modeling", "Sustainability", "Renewable Energy"],
    isOnline: true,
    badge: "Most Cited"
  }
];

const recentPublications = [
  {
    id: 1,
    title: "AI-Driven Diagnostics for Rural Health Systems in Ethiopia",
    authors: ["A. Oromo", "M. Ahmed", "S. Bekele"],
    journal: "Nature Digital Medicine",
    year: 2025,
    citations: 42,
    doi: "10.1038/s41746-025-01234-1",
    abstract: "An innovative AI framework for improving diagnostic accuracy in resource-limited settings...",
    tags: ["AI", "Healthcare", "Global Health"],
    access: "Open Access",
    downloads: 324
  },
  {
    id: 2,
    title: "Sustainable Agricultural Practices in Oromia: A Decade of Change",
    authors: ["H. Mohamed", "T. Abebe", "K. Worku"],
    journal: "Science Advances",
    year: 2024,
    citations: 28,
    doi: "10.1126/sciadv.adk4567",
    abstract: "Longitudinal study of sustainable farming practices and their impact on food security...",
    tags: ["Agriculture", "Sustainability", "Climate"],
    access: "Open Access",
    downloads: 187
  },
  {
    id: 3,
    title: "Climate Resilience in Oromo Communities: Traditional Knowledge Meets Modern Science",
    authors: ["A. Farah", "J. Smith", "R. Johnson"],
    journal: "The Lancet Planetary Health",
    year: 2025,
    citations: 56,
    doi: "10.1016/S2542-5196(25)00034-5",
    abstract: "Integration of indigenous knowledge with climate science for community resilience...",
    tags: ["Climate Change", "Indigenous Knowledge", "Community Health"],
    access: "Subscription",
    downloads: 421
  }
];

const upcomingEvents = [
  {
    id: 1,
    title: "Annual Oromo Research Symposium",
    date: "June 15-17, 2025",
    location: "Addis Ababa, Ethiopia & Virtual",
    description: "Showcasing cutting-edge research from Oromo scholars worldwide",
    speakers: 25,
    attendees: 300
  },
  {
    id: 2,
    title: "AI for Social Good Workshop",
    date: "July 8, 2025",
    location: "Virtual",
    description: "Hands-on workshop on applying AI solutions to community challenges",
    speakers: 8,
    attendees: 150
  },
  {
    id: 3,
    title: "Grant Writing Masterclass",
    date: "August 22, 2025",
    location: "Virtual",
    description: "Strategies for successful research grant applications",
    speakers: 5,
    attendees: 200
  }
];

const researchFields = [
  { icon: <FaMicroscope />, name: "Biomedical Sciences", count: 245 },
  { icon: <FaLaptopCode />, name: "Computer Science", count: 189 },
  { icon: <FaStethoscope />, name: "Public Health", count: 176 },
  { icon: <FaSeedling />, name: "Agricultural Sciences", count: 142 },
  { icon: <FaFlask />, name: "Engineering", count: 128 },
  { icon: <FaBookOpen />, name: "Social Sciences", count: 156 }
];

const testimonials = [
  {
    text: "The network connected me with collaborators for a groundbreaking study on water security.",
    author: "Dr. Sarah Bekele",
    role: "Environmental Scientist, University of Nairobi"
  },
  {
    text: "Found my perfect postdoc position through connections made here.",
    author: "Dr. Michael Tadesse",
    role: "Postdoctoral Fellow, University of Toronto"
  },
  {
    text: "Our cross-disciplinary project received funding after being showcased on this platform.",
    author: "Dr. Elena Teshome",
    role: "Research Director, Addis Ababa University"
  }
];

export default function ModernPublicHome() {
  return (
    <div className="modern-researcher-network">
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm fixed-top">
        <div className="container">
          <a className="navbar-brand fw-bold text-primary d-flex align-items-center" href="/">
            <FaGraduationCap className="me-2" />
            <span>Oromo Research Network</span>
          </a>
          
          <div className="d-flex align-items-center ms-auto">
            <div className="input-group input-group-sm me-3" style={{ width: "300px" }}>
              <span className="input-group-text bg-transparent border-end-0">
                <FaSearch className="text-muted" />
              </span>
              <input 
                type="text" 
                className="form-control border-start-0" 
                placeholder="Search researchers, publications, topics..."
              />
            </div>
            
            <a href="/researcher/login" className="btn btn-outline-primary btn-sm me-2">Sign In</a>
            <a href="/researcher/register" className="btn btn-primary btn-sm">
              <FaUserPlus className="me-1" /> Join Free
            </a>
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
                  Join 2,500+ academics, scientists, and innovators. Share your research, 
                  find collaborators, and advance your career.
                </p>
                
                <div className="d-flex flex-wrap gap-3 mb-4">
                  <a href="/register" className="btn btn-primary btn-lg px-4">
                    Create Profile <FaArrowRight className="ms-2" />
                  </a>
                  <a href="/discover" className="btn btn-outline-primary btn-lg px-4">
                    <FaSearch className="me-2" /> Explore Research
                  </a>
                </div>
                
                <div className="d-flex align-items-center text-muted">
                  <div className="d-flex me-4">
                    {[1,2,3,4].map(i => (
                      <div 
                        key={i}
                        className="border border-2 border-white rounded-circle"
                        style={{
                          width: 40,
                          height: 40,
                          marginLeft: i > 1 ? -10 : 0,
                          background: `url(https://i.pravatar.cc/40?img=${i})`,
                          backgroundSize: 'cover'
                        }}
                      />
                    ))}
                  </div>
                  <div>
                    <span className="fw-bold text-dark">2,500+</span> researchers from 
                    <span className="fw-bold text-dark ms-1">45+</span> countries
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-6">
              <div className="hero-image position-relative">
                <div className="floating-card card border-0 shadow-lg" style={{ 
                  position: 'absolute', 
                  top: '-20px', 
                  right: '100px',
                  width: '280px',
                  zIndex: 2 
                }}>
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <div className="avatar-sm me-3">
                        <img 
                          src="https://i.pravatar.cc/40?img=5" 
                          className="rounded-circle"
                          alt="Researcher"
                          width="40"
                        />
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold">Dr. Sarah Bekele</h6>
                        <small className="text-muted">Published new research</small>
                      </div>
                    </div>
                    <p className="small mb-2">"Our team discovered novel biomarkers for early detection..."</p>
                    <div className="d-flex justify-content-between">
                      <span className="badge bg-light text-dark">Cell Biology</span>
                      <small className="text-muted">2h ago</small>
                    </div>
                  </div>
                </div>
                
                <div className="floating-card card border-0 shadow-lg" style={{ 
                  position: 'absolute', 
                  bottom: '50px', 
                  left: '20px',
                  width: '250px',
                  zIndex: 2 
                }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-success">Funding Alert</span>
                      <FaHeart className="text-danger" />
                    </div>
                    <h6 className="fw-bold mb-1">NIH Grant Opportunity</h6>
                    <small className="text-muted">$500K for AI in Healthcare</small>
                    <div className="mt-2">
                      <small className="text-primary">Deadline: Dec 15</small>
                    </div>
                  </div>
                </div>
                
                <img 
                  src="/oromo-research-network.png"
                  alt="Research Collaboration"
                  className="img-fluid rounded-3 shadow-lg"
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
            <a href="/researchers" className="btn btn-outline-primary">
              View All <FaArrowRight className="ms-2" />
            </a>
          </div>
          
          <div className="row g-4">
            {featuredResearchers.map(researcher => (
              <div key={researcher.id} className="col-lg-4 col-md-6">
                <div className="card researcher-card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="position-relative">
                        <img 
                          src={researcher.profileImg} 
                          alt={researcher.name}
                          className="rounded-circle mb-3"
                          width="80"
                          height="80"
                        />
                        {researcher.isOnline && (
                          <span className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white"
                            style={{ width: 15, height: 15 }}
                          />
                        )}
                      </div>
                      <span className="badge bg-primary bg-opacity-10 text-primary">
                        {researcher.badge}
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
                        <div className="fw-bold text-primary">{researcher.citations}</div>
                        <small className="text-muted">Citations</small>
                      </div>
                      <div className="text-center">
                        <div className="fw-bold text-primary">{researcher.publications}</div>
                        <small className="text-muted">Publications</small>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      {researcher.researchAreas.map((area, idx) => (
                        <span key={idx} className="badge bg-light text-dark me-1 mb-1">
                          {area}
                        </span>
                      ))}
                    </div>
                    
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-primary flex-fill">
                        <FaPaperPlane className="me-1" /> Connect
                      </button>
                      <button className="btn btn-sm btn-primary flex-fill">
                        View Profile
                      </button>
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
                <div className="field-card card border-0 text-center p-4 h-100 hover-lift">
                  <div className="icon-wrapper bg-primary bg-opacity-10 text-primary rounded-circle mb-3 mx-auto"
                    style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {field.icon}
                  </div>
                  <h6 className="fw-bold mb-1">{field.name}</h6>
                  <small className="text-muted">{field.count} researchers</small>
                </div>
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
              <a href="/publications" className="btn btn-primary btn-sm">
                View All
              </a>
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
                    
                    <h5 className="fw-bold mb-3">{pub.title}</h5>
                    
                    <div className="mb-3">
                      <small className="text-muted">Authors: </small>
                      <small>{pub.authors.join(', ')}</small>
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
                      {pub.tags.map((tag, idx) => (
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
                      
                      <button className="btn btn-primary btn-sm">
                        <FaDownload className="me-1" /> PDF
                      </button>
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
            <a href="/events" className="btn btn-outline-primary">
              <FaCalendarAlt className="me-2" /> All Events
            </a>
          </div>
          
          <div className="row g-4">
            {upcomingEvents.map(event => (
              <div key={event.id} className="col-lg-4 col-md-6">
                <div className="card event-card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-start mb-3">
                      <div className="date-box bg-primary text-white text-center p-3 me-3 rounded-2">
                        <div className="fw-bold fs-5">15</div>
                        <small>JUN</small>
                      </div>
                      <div>
                        <h5 className="fw-bold mb-1">{event.title}</h5>
                        <div className="text-muted small">
                          <FaCalendarAlt className="me-1" /> {event.date}
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
                      
                      <button className="btn btn-primary btn-sm">
                        Register
                      </button>
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
                    <a href="/register" className="btn btn-primary btn-lg px-5">
                      Create Free Profile
                    </a>
                    <a href="/discover" className="btn btn-outline-primary btn-lg px-5">
                      Explore Network
                    </a>
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
                <li className="mb-2"><a href="#" className="text-white-75 text-decoration-none">Discover</a></li>
                <li className="mb-2"><a href="#" className="text-white-75 text-decoration-none">Publications</a></li>
                <li className="mb-2"><a href="#" className="text-white-75 text-decoration-none">Events</a></li>
                <li className="mb-2"><a href="#" className="text-white-75 text-decoration-none">Jobs</a></li>
                <li><a href="#" className="text-white-75 text-decoration-none">Funding</a></li>
              </ul>
            </div>
            
            <div className="col-lg-2 col-md-4 mb-4">
              <h6 className="fw-bold mb-3">Company</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#" className="text-white-75 text-decoration-none">About</a></li>
                <li className="mb-2"><a href="#" className="text-white-75 text-decoration-none">Team</a></li>
                <li className="mb-2"><a href="#" className="text-white-75 text-decoration-none">Careers</a></li>
                <li className="mb-2"><a href="#" className="text-white-75 text-decoration-none">Blog</a></li>
                <li><a href="#" className="text-white-75 text-decoration-none">Contact</a></li>
              </ul>
            </div>
            
            <div className="col-lg-4 col-md-4 mb-4">
              <h6 className="fw-bold mb-3">Stay Updated</h6>
              <p className="text-white-75 small mb-3">
                Subscribe to our newsletter for the latest research and opportunities.
              </p>
              <div className="input-group">
                <input type="email" className="form-control" placeholder="Your email" />
                <button className="btn btn-primary">Subscribe</button>
              </div>
            </div>
          </div>
          
          <hr className="text-white-50 my-4" />
          
          <div className="row">
            <div className="col-md-6">
              <p className="text-white-75 small mb-0">
                © 2025 Oromo Research Network. All rights reserved.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <a href="#" className="text-white-75 small text-decoration-none me-3">Privacy Policy</a>
              <a href="#" className="text-white-75 small text-decoration-none me-3">Terms of Service</a>
              <a href="#" className="text-white-75 small text-decoration-none">Cookie Policy</a>
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
          animation-delay: calc(var(--i, 0) * 0.5s);
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
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
  );
}