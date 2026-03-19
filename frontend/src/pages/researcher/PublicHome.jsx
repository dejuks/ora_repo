import React from "react";
import { Link } from "react-router-dom";
import {
  FaGraduationCap,
  FaSignInAlt,
  FaUsers,
  FaBookOpen,
  FaGlobeAfrica,
  FaArrowRight,
} from "react-icons/fa";

export default function ORAHome() {
  return (
    <div style={styles.container}>

      {/* NAVBAR */}
      <nav style={styles.nav}>
        <div style={styles.logo}>
          <FaGraduationCap size={26} color="#0a66c2" />
          <span style={styles.logoText}>ORA Network</span>
        </div>

        <div style={styles.navRight}>
          <Link to="/researcher/login" style={styles.loginBtn}>
            <FaSignInAlt /> Sign in
          </Link>
          <Link to="/researcher/register" style={styles.joinBtn}>
            Join now
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroLeft}>
          <h1 style={styles.heroTitle}>
            Welcome to your professional research community
          </h1>

          <p style={styles.heroText}>
            Connect with Oromo researchers worldwide, share your work, 
            and build your academic identity.
          </p>

          <Link to="/researcher/register" style={styles.primaryBtn}>
            Join ORA Network <FaArrowRight />
          </Link>
        </div>

        <div style={styles.heroRight}>
          
          <img
            src="/ntw.jpg"
            alt="researchers"
            style={styles.heroImage}
          />
        </div>
      </section>

      {/* TRUST SECTION */}
      <section style={styles.trust}>
        <p>Trusted by researchers from 25+ countries</p>
        <div style={styles.trustStats}>
          <div>
            <h2>500+</h2>
            <span>Researchers</span>
          </div>
          <div>
            <h2>1000+</h2>
            <span>Publications</span>
          </div>
          <div>
            <h2>50+</h2>
            <span>Institutions</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={styles.features}>
        <h2>Why join ORA?</h2>

        <div style={styles.featureGrid}>
          <div style={styles.card}>
            <FaUsers size={30} color="#0a66c2" />
            <h3>Networking</h3>
            <p>Connect with global Oromo scholars</p>
          </div>

          <div style={styles.card}>
            <FaBookOpen size={30} color="#0a66c2" />
            <h3>Publications</h3>
            <p>Share and discover research papers</p>
          </div>

          <div style={styles.card}>
            <FaGlobeAfrica size={30} color="#0a66c2" />
            <h3>Global Reach</h3>
            <p>Collaborate across continents</p>
          </div>
        </div>
      </section>

  

      {/* CTA */}
      <section style={styles.cta}>
        <h2>Start your research journey today</h2>
        <Link to="/researcher/register" style={styles.primaryBtn}>
          Get Started
        </Link>
      </section>

    </div>
  );
}
const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f3f2ef",
  },

  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 50px",
    backgroundColor: "white",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },

  logo: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    fontWeight: "bold",
  },

  logoText: {
    fontSize: "20px",
  },

  navRight: {
    display: "flex",
    gap: "15px",
  },

  loginBtn: {
    textDecoration: "none",
    color: "#0a66c2",
    fontWeight: "600",
  },

  joinBtn: {
    backgroundColor: "#0a66c2",
    color: "white",
    padding: "8px 16px",
    borderRadius: "20px",
    textDecoration: "none",
  },

  hero: {
    display: "flex",
    padding: "60px 50px",
    alignItems: "center",
    gap: "40px",
    backgroundColor: "white",
  },

  heroLeft: { flex: 1 },

  heroTitle: {
    fontSize: "40px",
    marginBottom: "20px",
  },

  heroText: {
    fontSize: "18px",
    marginBottom: "20px",
    color: "#555",
  },

  primaryBtn: {
    backgroundColor: "#0a66c2",
    color: "white",
    padding: "12px 25px",
    borderRadius: "25px",
    textDecoration: "none",
  },

  heroRight: { flex: 1 },

  heroImage: {
    width: "100%",
    borderRadius: "10px",
  },

  trust: {
    textAlign: "center",
    padding: "40px",
  },

  trustStats: {
    display: "flex",
    justifyContent: "center",
    gap: "50px",
    marginTop: "20px",
  },

  features: {
    padding: "50px",
    backgroundColor: "white",
    textAlign: "center",
  },

  featureGrid: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    marginTop: "30px",
  },

  card: {
    padding: "20px",
    backgroundColor: "#f9fafb",
    borderRadius: "10px",
    width: "250px",
  },

  researchers: {
    padding: "50px",
    textAlign: "center",
  },

  profileGrid: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    marginTop: "30px",
  },

  profileCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    width: "200px",
  },

  avatar: {
    borderRadius: "50%",
    marginBottom: "10px",
  },

  connectBtn: {
    backgroundColor: "#0a66c2",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "20px",
    cursor: "pointer",
  },

  cta: {
    padding: "50px",
    textAlign: "center",
    backgroundColor: "white",
  },
};