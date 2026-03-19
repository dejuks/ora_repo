import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  // ORA Logo Exact Colors
  const colors = {
    // // From the logo image
    //  primaryGreen: "#947e9c",      // Dark green from ORANNOO/OROMOO text
    // secondaryGreen: "#e5a8da",     // Medium green from ORA circle
    primaryGreen: "#0A3D2E",      // Dark green from ORANNOO/OROMOO text
    secondaryGreen: "#1A5A3A",     // Medium green from ORA circle
    accentGold: "#D4AF37",         // Gold from the logo accents
    lightGold: "#E5C55E",          // Lighter gold for highlights
    cream: "#F5F0E6",              // Off-white background
    white: "#FFFFFF",
    smokeWhite: "#F8F4ED",         // Smoke white background
    lightSmoke: "#FAF7F2",         // Lighter smoke for sections
    darkSmoke: "#E8E2D6",          // Darker smoke for borders/shadows
    textDark: "#1A2E25",           // Dark text color
    textLight: "#F5F0E6",          // Light text color
  };

  const currentYear = new Date().getFullYear();

  const footerSections = {
    resources: {
      title: "Resources",
      links: [
        { name: "Journal", path: "/journal", icon: "📚" },
        { name: "Repository", path: "/repository", icon: "🗂️" },
        { name: "E-books", path: "/ebooks", icon: "📱" },
        { name: "Library", path: "/library", icon: "🏛️" },
        { name: "Wikipedia", path: "/wikipedia", icon: "🌍" },
      ],
    },
    community: {
      title: "Community",
      links: [
        { name: "Network", path: "/network", icon: "🤝" },
        { name: "Events", path: "/events", icon: "📅" },
        { name: "Blog", path: "/blog", icon: "✍️" },
        { name: "Forum", path: "/forum", icon: "💬" },
        { name: "Membership", path: "/join", icon: "⭐" },
      ],
    },
    about: {
      title: "About ORA",
      links: [
        { name: "Our Mission", path: "/mission", icon: "🎯" },
        { name: "Our Vision", path: "/vision", icon: "👁️" },
        { name: "Team", path: "/team", icon: "👥" },
        { name: "Partners", path: "/partners", icon: "🤝" },
        { name: "Careers", path: "/careers", icon: "💼" },
      ],
    },
    support: {
      title: "Support",
      links: [
        { name: "Help Center", path: "/help", icon: "❓" },
        { name: "Contact Us", path: "/contact", icon: "📧" },
        { name: "FAQs", path: "/faqs", icon: "📋" },
        { name: "Report Issue", path: "/report", icon: "⚠️" },
        { name: "Donate", path: "/donate", icon: "❤️" },
      ],
    },
  };

  const socialLinks = [
    { name: "Twitter", icon: "𝕏", url: "https://twitter.com/ORAOromo", color: "#1DA1F2" },
    { name: "Facebook", icon: "f", url: "https://facebook.com/ORA", color: "#4267B2" },
    { name: "LinkedIn", icon: "in", url: "https://linkedin.com/company/ora", color: "#0077B5" },
    { name: "YouTube", icon: "▶", url: "https://youtube.com/@ORA", color: "#FF0000" },
    { name: "Instagram", icon: "📷", url: "https://instagram.com/ora_oromo", color: "#E4405F" },
    { name: "Telegram", icon: "📱", url: "https://t.me/ORA", color: "#26A5E4" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
    { name: "Cookie Policy", path: "/cookies" },
    { name: "Accessibility", path: "/accessibility" },
    { name: "Sitemap", path: "/sitemap" },
  ];

  const styles = {
    footer: {
      background: colors.primaryGreen,
      color: colors.textLight,
      position: "relative",
      fontFamily: "'Poppins', sans-serif",
      borderTop: `4px solid ${colors.accentGold}`,
    },

    container: {
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "0 20px",
    },

    // Main Footer
    mainFooter: {
      padding: "60px 0 40px",
      background: `linear-gradient(135deg, ${colors.primaryGreen} 0%, ${colors.secondaryGreen} 100%)`,
    },

    brandSection: {
      marginBottom: "40px",
    },

    logoContainer: {
      textDecoration: "none",
      display: "inline-flex",
      flexDirection: "column",
      marginBottom: "20px",
      position: "relative",
    },

    logoOromo: {
      fontSize: "2rem",
      fontWeight: "700",
      color: colors.smokeWhite,
      letterSpacing: "2px",
      textShadow: `2px 2px 4px ${colors.primaryGreen}`,
    },

    logoResearcher: {
      fontSize: "1.5rem",
      fontWeight: "500",
      color: colors.accentGold,
      letterSpacing: "1px",
      marginTop: "-5px",
    },

    logoAssociation: {
      fontSize: "1rem",
      fontWeight: "400",
      color: colors.smokeWhite,
      opacity: 0.9,
      letterSpacing: "1px",
      marginTop: "5px",
    },

    brandDescription: {
      fontSize: "0.95rem",
      lineHeight: 1.8,
      opacity: 0.9,
      maxWidth: "400px",
      marginBottom: "25px",
      color: colors.smokeWhite,
    },

    contactInfo: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      marginBottom: "25px",
    },

    contactItem: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "0.9rem",
      opacity: 0.8,
      color: colors.smokeWhite,
    },

    contactIcon: {
      fontSize: "1.1rem",
      color: colors.accentGold,
    },

    newsletter: {
      maxWidth: "300px",
    },

    newsletterTitle: {
      fontSize: "1rem",
      marginBottom: "12px",
      color: colors.accentGold,
    },

    newsletterForm: {
      display: "flex",
      gap: "10px",
    },

    newsletterInput: {
      flex: 1,
      padding: "12px 15px",
      borderRadius: "25px",
      border: `1px solid ${colors.accentGold}`,
      background: colors.smokeWhite,
      color: colors.textDark,
      outline: "none",
      "&::placeholder": {
        color: `${colors.textDark}80`,
      },
      "&:focus": {
        borderColor: colors.accentGold,
        boxShadow: `0 0 0 3px ${colors.accentGold}30`,
      },
    },

    newsletterButton: {
      padding: "12px 20px",
      background: colors.accentGold,
      color: colors.primaryGreen,
      border: "none",
      borderRadius: "25px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      whiteSpace: "nowrap",
      "&:hover": {
        background: colors.lightGold,
        transform: "scale(1.05)",
        boxShadow: `0 5px 15px ${colors.accentGold}80`,
      },
    },

    // Links Grid
    linksGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "30px",
      marginTop: "40px",
    },

    linkColumn: {
      display: "flex",
      flexDirection: "column",
    },

    columnTitle: {
      fontSize: "1.1rem",
      fontWeight: "600",
      marginBottom: "20px",
      color: colors.accentGold,
      position: "relative",
      paddingBottom: "10px",
      "&::after": {
        content: '""',
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "40px",
        height: "2px",
        background: colors.accentGold,
      },
    },

    linkList: {
      listStyle: "none",
      padding: 0,
      margin: 0,
    },

    linkItem: {
      marginBottom: "12px",
    },

    link: {
      color: colors.smokeWhite,
      textDecoration: "none",
      fontSize: "0.9rem",
      opacity: 0.8,
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      "&:hover": {
        opacity: 1,
        color: colors.accentGold,
        transform: "translateX(5px)",
      },
    },

    linkIcon: {
      fontSize: "1rem",
    },

    // Social Bar
    socialBar: {
      background: colors.secondaryGreen,
      padding: "20px 0",
      borderTop: `1px solid ${colors.accentGold}`,
      borderBottom: `1px solid ${colors.accentGold}`,
    },

    socialContent: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "20px",
    },

    socialText: {
      fontSize: "0.95rem",
      opacity: 0.9,
      color: colors.smokeWhite,
    },

    socialIcons: {
      display: "flex",
      gap: "15px",
      flexWrap: "wrap",
    },

    socialIcon: (socialColor) => ({
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      background: colors.smokeWhite,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textDecoration: "none",
      color: colors.primaryGreen,
      fontSize: "1.2rem",
      fontWeight: "600",
      transition: "all 0.3s ease",
      border: `2px solid ${colors.accentGold}`,
      "&:hover": {
        background: socialColor,
        color: colors.white,
        transform: "translateY(-5px) scale(1.1)",
        borderColor: socialColor,
      },
    }),

    // Bottom Footer
    bottomFooter: {
      padding: "30px 0",
      background: colors.primaryGreen,
    },

    bottomContent: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "20px",
    },

    legalLinks: {
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      alignItems: "center",
    },

    legalLink: {
      color: colors.smokeWhite,
      textDecoration: "none",
      fontSize: "0.85rem",
      opacity: 0.7,
      transition: "opacity 0.3s ease",
      "&:hover": {
        opacity: 1,
        color: colors.accentGold,
      },
    },

    separator: {
      color: `${colors.accentGold}60`,
      fontSize: "0.85rem",
    },

    copyright: {
      textAlign: "center",
    },

    copyrightSmall: {
      fontSize: "0.8rem",
      opacity: 0.6,
      marginTop: "5px",
      color: colors.smokeWhite,
    },

    languageSelector: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      background: colors.secondaryGreen,
      padding: "8px 15px",
      borderRadius: "25px",
      border: `1px solid ${colors.accentGold}`,
    },

    languageIcon: {
      fontSize: "1.1rem",
      color: colors.accentGold,
    },

    languageSelect: {
      background: "transparent",
      border: "none",
      color: colors.smokeWhite,
      fontSize: "0.9rem",
      outline: "none",
      cursor: "pointer",
      "& option": {
        background: colors.secondaryGreen,
        color: colors.smokeWhite,
      },
    },

    // Back to Top Button
    backToTop: {
      position: "fixed",
      bottom: "30px",
      right: "30px",
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      background: colors.accentGold,
      color: colors.primaryGreen,
      border: `2px solid ${colors.smokeWhite}`,
      fontSize: "1.5rem",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.3s ease",
      boxShadow: `0 5px 20px ${colors.accentGold}80`,
      zIndex: 1000,
      "&:hover": {
        transform: "translateY(-5px) scale(1.1)",
        boxShadow: `0 10px 30px ${colors.accentGold}`,
        background: colors.smokeWhite,
        color: colors.accentGold,
      },
    },
  };

  return (
    <footer style={styles.footer}>
      {/* Main Footer */}
      <div style={styles.mainFooter}>
        <div style={styles.container}>
          {/* Brand Section */}
          <div style={styles.brandSection}>
            <Link to="/" style={styles.logoContainer}>
              <span style={styles.logoOromo}>ORA</span>
              <span style={styles.logoResearcher}>ORA</span>
              <span style={styles.logoAssociation}>OROMO RESEARCH ASSOCIATION</span>
            </Link>
            
            <p style={styles.brandDescription}>
              Preserving Oromo heritage, advancing research, and connecting scholars 
              worldwide through innovative digital solutions.
            </p>

            {/* Contact Info */}
            <div style={styles.contactInfo}>
              <div style={styles.contactItem}>
                <span style={styles.contactIcon}>📍</span>
                <span>Addis Ababa, Ethiopia / Minneapolis, USA</span>
              </div>
              <div style={styles.contactItem}>
                <span style={styles.contactIcon}>📧</span>
                <span>info@oromo-researcher.org</span>
              </div>
              <div style={styles.contactItem}>
                <span style={styles.contactIcon}>📞</span>
                <span>+251 912 345 678 / +1 (612) 555-0123</span>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div style={styles.newsletter}>
              <h4 style={styles.newsletterTitle}>Stay Connected</h4>
              <div style={styles.newsletterForm}>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  style={styles.newsletterInput}
                />
                <button style={styles.newsletterButton}>
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div style={styles.linksGrid}>
            {Object.entries(footerSections).map(([key, section]) => (
              <div key={key} style={styles.linkColumn}>
                <h4 style={styles.columnTitle}>{section.title}</h4>
                <ul style={styles.linkList}>
                  {section.links.map((link) => (
                    <li key={link.path} style={styles.linkItem}>
                      <Link to={link.path} style={styles.link}>
                        <span style={styles.linkIcon}>{link.icon}</span>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social Media Bar */}
      <div style={styles.socialBar}>
        <div style={styles.container}>
          <div style={styles.socialContent}>
            <span style={styles.socialText}>Follow ORA on social media:</span>
            <div style={styles.socialIcons}>
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.socialIcon(social.color)}
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div style={styles.bottomFooter}>
        <div style={styles.container}>
          <div style={styles.bottomContent}>
            {/* Legal Links */}
            <div style={styles.legalLinks}>
              {legalLinks.map((link, index) => (
                <React.Fragment key={link.path}>
                  <Link to={link.path} style={styles.legalLink}>
                    {link.name}
                  </Link>
                  {index < legalLinks.length - 1 && (
                    <span style={styles.separator}>•</span>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Copyright */}
            <div style={styles.copyright}>
              <p>© {currentYear} Oromo Researcher Association (ORA). All rights reserved.</p>
              <p style={styles.copyrightSmall}>
                Empowering Oromo scholarship since 2015 | Registered 501(c)(3) non-profit
              </p>
            </div>

            {/* Language Selector */}
            <div style={styles.languageSelector}>
              <span style={styles.languageIcon}>🌐</span>
              <select style={styles.languageSelect}>
                <option value="en">English</option>
                <option value="om">Afaan Oromoo</option>
                <option value="am">አማርኛ</option>
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button 
        style={styles.backToTop}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        ↑
      </button>
    </footer>
  );
}