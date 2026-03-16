import React from "react";
import { Link } from "react-router-dom";
import { 
  FaGraduationCap, 
  FaSignInAlt, 
  FaUsers, 
  FaBookOpen, 
  FaGlobeAfrica,
  FaChartLine,
  FaArrowRight
} from "react-icons/fa";

export default function ORAHome() {
  return (
    <div style={styles.container}>
      
      {/* NAVIGATION */}
      <nav style={styles.nav}>
        <div style={styles.navLogo}>
          <FaGraduationCap size={30} color="#2563eb" />
          <span style={styles.navTitle}>ORA</span>
        </div>
        <div style={styles.navLinks}>
          <a href="#about" style={styles.navLink}>About</a>
          <a href="#features" style={styles.navLink}>Features</a>
          <a href="#contact" style={styles.navLink}>Contact</a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>
            <FaGlobeAfrica style={styles.badgeIcon} />
            <span>Global Oromo Scholars Network</span>
          </div>
          
          <h1 style={styles.mainTitle}>
            Oromo Research Association <span style={styles.titleHighlight}>(ORA)</span>
          </h1>
          
          <p style={styles.subtitle}>
            Connecting scholars worldwide to advance research, foster collaboration, 
            and promote knowledge sharing across disciplines
          </p>

          <div style={styles.ctaSection}>
            <Link to="/researcher/login" style={styles.primaryButton}>
              <FaSignInAlt style={styles.buttonIcon} />
              Login to Platform
              <FaArrowRight style={styles.buttonIconRight} />
            </Link>
            
            <button style={styles.secondaryButton}>
              Learn More
            </button>
          </div>

          <div style={styles.statsContainer}>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>500+</span>
              <span style={styles.statLabel}>Scholars</span>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>25+</span>
              <span style={styles.statLabel}>Countries</span>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>1000+</span>
              <span style={styles.statLabel}>Publications</span>
            </div>
          </div>
        </div>

        <div style={styles.heroImage}>
          <div style={styles.abstractShape1}></div>
          <div style={styles.abstractShape2}></div>
          <div style={styles.iconGrid}>
            <FaBookOpen style={styles.gridIcon} />
            <FaUsers style={styles.gridIcon} />
            <FaChartLine style={styles.gridIcon} />
            <FaGraduationCap style={styles.gridIcon} />
          </div>
        </div>
      </div>

      {/* ABOUT SECTION */}
      <div id="about" style={styles.aboutSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>About ORA</h2>
          <div style={styles.titleUnderline}></div>
        </div>
        
        <div style={styles.aboutContent}>
          <p style={styles.aboutText}>
            The Oromo Research Association (ORA) is a prestigious professional platform that 
            connects Oromo scholars, researchers, and academics across the globe. We foster 
            interdisciplinary collaboration and facilitate the dissemination of groundbreaking 
            research across multiple domains.
          </p>

          <div style={styles.strengthCards}>
            <div style={styles.strengthCard}>
              <div style={styles.cardIconBg}>
                <FaUsers style={styles.cardIcon} />
              </div>
              <h3 style={styles.cardTitle}>Global Network</h3>
              <p style={styles.cardText}>Connect with researchers worldwide and build lasting professional relationships</p>
            </div>

            <div style={styles.strengthCard}>
              <div style={styles.cardIconBg}>
                <FaBookOpen style={styles.cardIcon} />
              </div>
              <h3 style={styles.cardTitle}>Research Excellence</h3>
              <p style={styles.cardText}>Access cutting-edge research across multiple disciplines</p>
            </div>

            <div style={styles.strengthCard}>
              <div style={styles.cardIconBg}>
                <FaGraduationCap style={styles.cardIcon} />
              </div>
              <h3 style={styles.cardTitle}>Mentorship</h3>
              <p style={styles.cardText}>Support young scholars through mentorship programs</p>
            </div>
          </div>
        </div>
      </div>

      {/* RESEARCH AREAS */}
      <div id="features" style={styles.researchSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Research Areas</h2>
          <div style={styles.titleUnderline}></div>
        </div>

        <div style={styles.researchGrid}>
          {[
            "Science & Technology",
            "Social Sciences",
            "Agriculture",
            "Health & Medicine",
            "Education",
            "Economics"
          ].map((area, index) => (
            <div key={index} style={styles.researchCard}>
              <span style={styles.researchIcon}>🔬</span>
              <span style={styles.researchName}>{area}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA BANNER */}
      <div style={styles.ctaBanner}>
        <div style={styles.ctaContent}>
          <h3 style={styles.ctaTitle}>Ready to join the ORA community?</h3>
          <p style={styles.ctaText}>
            Connect with fellow researchers, access resources, and contribute to advancing knowledge
          </p>
          <Link to="/researcher/login" style={styles.ctaButton}>
            Get Started Today
            <FaArrowRight style={styles.ctaButtonIcon} />
          </Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          © 2024 Oromo Research Association (ORA). All rights reserved.
        </p>
        <div style={styles.footerLinks}>
          <a href="#" style={styles.footerLink}>Privacy Policy</a>
          <a href="#" style={styles.footerLink}>Terms of Service</a>
          <a href="#" style={styles.footerLink}>Contact</a>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },

  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 50px",
    backgroundColor: "rgba(255,255,255,0.95)",
    boxShadow: "0 2px 20px rgba(0,0,0,0.1)",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backdropFilter: "blur(10px)",
  },

  navLogo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  navTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#2d3748",
  },

  navLinks: {
    display: "flex",
    gap: "30px",
  },

  navLink: {
    color: "#4a5568",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "500",
    transition: "color 0.3s ease",
    cursor: "pointer",
    ":hover": {
      color: "#667eea",
    },
  },

  heroSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "120px 50px 80px",
    maxWidth: "1200px",
    margin: "0 auto",
    gap: "40px",
  },

  heroContent: {
    flex: 1,
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: "8px 16px",
    borderRadius: "30px",
    marginBottom: "20px",
    backdropFilter: "blur(10px)",
    color: "white",
  },

  badgeIcon: {
    fontSize: "16px",
  },

  mainTitle: {
    fontSize: "48px",
    fontWeight: "800",
    color: "white",
    marginBottom: "20px",
    lineHeight: "1.2",
  },

  titleHighlight: {
    color: "#fbbf24",
    display: "block",
  },

  subtitle: {
    fontSize: "18px",
    color: "rgba(255,255,255,0.9)",
    marginBottom: "30px",
    lineHeight: "1.6",
    maxWidth: "500px",
  },

  ctaSection: {
    display: "flex",
    gap: "20px",
    marginBottom: "40px",
  },

  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    padding: "15px 30px",
    backgroundColor: "white",
    color: "#667eea",
    textDecoration: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "600",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    border: "none",
    cursor: "pointer",
  },

  buttonIcon: {
    fontSize: "18px",
  },

  buttonIconRight: {
    fontSize: "14px",
  },

  secondaryButton: {
    padding: "15px 30px",
    backgroundColor: "transparent",
    color: "white",
    border: "2px solid white",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  statsContainer: {
    display: "flex",
    alignItems: "center",
    gap: "30px",
  },

  statItem: {
    display: "flex",
    flexDirection: "column",
  },

  statNumber: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "white",
  },

  statLabel: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.8)",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },

  statDivider: {
    width: "1px",
    height: "40px",
    backgroundColor: "rgba(255,255,255,0.3)",
  },

  heroImage: {
    flex: 1,
    position: "relative",
    height: "400px",
  },

  abstractShape1: {
    position: "absolute",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "linear-gradient(45deg, #fbbf24, #f59e0b)",
    opacity: 0.3,
    top: "20px",
    right: "20px",
    filter: "blur(60px)",
  },

  abstractShape2: {
    position: "absolute",
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    background: "linear-gradient(45deg, #34d399, #10b981)",
    opacity: 0.3,
    bottom: "20px",
    left: "20px",
    filter: "blur(40px)",
  },

  iconGrid: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
    padding: "40px",
    backgroundColor: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.2)",
    zIndex: 1,
  },

  gridIcon: {
    fontSize: "48px",
    color: "white",
    padding: "20px",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: "15px",
  },

  aboutSection: {
    padding: "80px 50px",
    backgroundColor: "white",
  },

  sectionHeader: {
    textAlign: "center",
    marginBottom: "50px",
  },

  sectionTitle: {
    fontSize: "36px",
    color: "#2d3748",
    marginBottom: "15px",
  },

  titleUnderline: {
    width: "80px",
    height: "4px",
    background: "linear-gradient(90deg, #667eea, #764ba2)",
    margin: "0 auto",
    borderRadius: "2px",
  },

  aboutContent: {
    maxWidth: "800px",
    margin: "0 auto",
    textAlign: "center",
  },

  aboutText: {
    fontSize: "18px",
    color: "#4a5568",
    lineHeight: "1.8",
    marginBottom: "50px",
  },

  strengthCards: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "30px",
    marginTop: "40px",
  },

  strengthCard: {
    padding: "30px",
    backgroundColor: "#f7fafc",
    borderRadius: "15px",
    transition: "transform 0.3s ease",
    ":hover": {
      transform: "translateY(-5px)",
    },
  },

  cardIconBg: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },

  cardIcon: {
    fontSize: "24px",
    color: "white",
  },

  cardTitle: {
    fontSize: "20px",
    color: "#2d3748",
    marginBottom: "10px",
  },

  cardText: {
    fontSize: "14px",
    color: "#718096",
    lineHeight: "1.6",
  },

  researchSection: {
    padding: "80px 50px",
    background: "linear-gradient(135deg, #f6f9fc 0%, #edf2f7 100%)",
  },

  researchGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    maxWidth: "1000px",
    margin: "0 auto",
  },

  researchCard: {
    padding: "30px",
    backgroundColor: "white",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    transition: "transform 0.3s ease",
    cursor: "pointer",
    ":hover": {
      transform: "scale(105%)",
    },
  },

  researchIcon: {
    fontSize: "32px",
    display: "block",
    marginBottom: "10px",
  },

  researchName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#2d3748",
  },

  ctaBanner: {
    padding: "80px 50px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },

  ctaContent: {
    maxWidth: "600px",
    margin: "0 auto",
    textAlign: "center",
    color: "white",
  },

  ctaTitle: {
    fontSize: "32px",
    marginBottom: "20px",
  },

  ctaText: {
    fontSize: "18px",
    marginBottom: "30px",
    opacity: 0.9,
  },

  ctaButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    padding: "15px 40px",
    backgroundColor: "white",
    color: "#667eea",
    textDecoration: "none",
    borderRadius: "10px",
    fontSize: "18px",
    fontWeight: "600",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  },

  ctaButtonIcon: {
    fontSize: "18px",
  },

  footer: {
    padding: "40px 50px",
    backgroundColor: "#1a202c",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
  },

  footerText: {
    fontSize: "14px",
    color: "#a0aec0",
  },

  footerLinks: {
    display: "flex",
    gap: "30px",
  },

  footerLink: {
    color: "#a0aec0",
    textDecoration: "none",
    fontSize: "14px",
    transition: "color 0.3s ease",
    ":hover": {
      color: "white",
    },
  },
};