import React, { useState, useEffect, useRef } from 'react';

function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [counters, setCounters] = useState({ books: 0, researchers: 0, cities: 0, conferences: 0 });
  
  const sectionsRef = useRef({});

  // Color constants
  const COLORS = {
    primary: '#ead9e6ff', // Main brand color
    primaryLight: '#181819ff',
    primaryDark: '#131418ff',
    textDark: '#101111ff',
    textLight: '#1f1f20ff',
    textWhite: '#0c0b0bff',
    background: '#FFFFFF',
    cardBg: '#FAFAFA',
    border: '#E2E8F0',
    accent: '#d5d0dfff'
  };

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Update active section
      Object.entries(sectionsRef.current).forEach(([id, element]) => {
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(id);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animated counters
  useEffect(() => {
    const animateCounter = (start, end, duration, setter) => {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        setter(Math.floor(progress * (end - start) + start));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    };

    animateCounter(0, 4, 1500, (val) => setCounters(prev => ({ ...prev, books: val })));
    animateCounter(0, 100, 2000, (val) => setCounters(prev => ({ ...prev, researchers: val })));
    animateCounter(0, 10, 1800, (val) => setCounters(prev => ({ ...prev, cities: val })));
    animateCounter(0, 3, 1200, (val) => setCounters(prev => ({ ...prev, conferences: val })));
  }, []);

  // Data arrays
  const achievements = [
    { icon: '📚', title: "Research Publications", description: "4 landmark research books published" },
    { icon: '👥', title: "Community Engagement", description: "2 forums & 1 international conference organized" },
    { icon: '💻', title: "Digital Platform", description: "Comprehensive web-based system in development" },
    { icon: '🏪', title: "Strategic Expansion", description: "Bookshops planned in 10+ cities" }
  ];

  const coreValues = [
    { icon: '🛡️', title: "Integrity", description: "Ethical conduct, transparency, and fairness" },
    { icon: '🎯', title: "Relevance", description: "Socio-economic research for policy inputs" },
    { icon: '📊', title: "Evidence-based", description: "Rigorous, unbiased methodologies and analysis" },
    { icon: '⚖️', title: "Social Justice", description: "Advocacy for fairness and marginalized communities" },
    { icon: '🤝', title: "Participatory", description: "Engaging stakeholders as partners" },
    { icon: '💡', title: "Innovation", description: "Creative approaches to complex challenges" }
  ];

  const strategicPillars = [
    { letter: "A", title: "Archive", color: COLORS.primary, description: "Digitize all Oromoo research" },
    { letter: "B", title: "Becoming a Center", color: COLORS.accent, description: "Central hub for Oromoo research" },
    { letter: "C", title: "Combat", color: "#EF4444", description: "Correct misconceptions & narratives" },
    { letter: "D", title: "Encouraging", color: "#F59E0B", description: "Support researchers & artists" },
    { letter: "E", title: "Publication", color: "#10B981", description: "Publish & disseminate research" }
  ];

  const publications = [
    { title: "Finfinnee: Past and Present", year: "2024", badge: "Featured" },
    { title: "Annotated Bibliography (3000+)", year: "2023", badge: "Database" },
    { title: "In Search of Knowledge", year: "2023", badge: "Conference" },
    { title: "The Gada System of Government", year: "2023", badge: "Classic" }
  ];

  const footerLinks = {
    "Quick Links": ["Home", "About", "Research", "Publications", "Events", "Contact"],
    "Resources": ["Digital Library", "Research Database", "ORA Journal", "Oromoo Wikipedia", "Researcher Network"],
    "Publications": ["Recent Books", "Research Papers", "Conference Proceedings", "Digital Archives", "Annual Reports"],
    "Connect": ["Become Member", "Donate", "Volunteer", "Research Partnership", "Media Inquiry"]
  };

  // Inline styles
  const styles = {
    // Global
    container: {
      minHeight: '100vh',
      background: COLORS.background,
      color: COLORS.textDark,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      overflowX: 'hidden'
    },

    // Navigation
    navbar: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: isScrolled ? COLORS.primary : 'transparent',
      backdropFilter: isScrolled ? 'blur(20px)' : 'none',
      borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
      zIndex: 1000,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    navContent: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 24px',
      height: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      textDecoration: 'none'
    },
    logoIcon: {
      width: '44px',
      height: '44px',
      background: 'linear-gradient(135deg, #DBA8D0 0%, #C895BD 100%)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      fontWeight: 'bold',
      color: COLORS.textWhite,
      boxShadow: '0 4px 20px rgba(219, 168, 208, 0.3)'
    },
    logoText: {
      display: 'flex',
      flexDirection: 'column'
    },
    logoMain: {
      fontSize: '20px',
      fontWeight: '800',
      color: isScrolled ? COLORS.textWhite : COLORS.textDark
    },
    logoSub: {
      fontSize: '12px',
      color: isScrolled ? 'rgba(255, 255, 255, 0.9)' : COLORS.textLight,
      letterSpacing: '1px'
    },
    navLinks: {
      display: 'flex',
      gap: '32px',
      alignItems: 'center'
    },
    navLink: {
      color: isScrolled ? COLORS.textWhite : COLORS.textDark,
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: '500',
      letterSpacing: '0.5px',
      position: 'relative',
      padding: '8px 0',
      transition: 'all 0.3s ease'
    },
    navLinkActive: {
      color: isScrolled ? COLORS.textWhite : COLORS.primary,
      fontWeight: '600'
    },
    navIndicator: {
      position: 'absolute',
      bottom: '-2px',
      left: '0',
      width: '100%',
      height: '2px',
      background: isScrolled ? COLORS.textWhite : COLORS.primary,
      borderRadius: '2px',
      transform: 'scaleX(1)',
      transition: 'transform 0.3s ease'
    },
    ctaButton: {
      background: isScrolled ? COLORS.textWhite : COLORS.primary,
      color: isScrolled ? COLORS.primary : COLORS.textWhite,
      border: 'none',
      padding: '12px 28px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 20px rgba(219, 168, 208, 0.3)',
      letterSpacing: '0.5px'
    },
    mobileMenuButton: {
      display: 'none',
      background: 'none',
      border: 'none',
      color: isScrolled ? COLORS.textWhite : COLORS.textDark,
      fontSize: '24px',
      cursor: 'pointer'
    },

    // Hero Section
    hero: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F5FC 100%)'
    },
    heroContent: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '120px 24px 80px',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '60px',
      alignItems: 'center',
      position: 'relative',
      zIndex: 2
    },
    heroText: {
      maxWidth: '600px'
    },
    heroBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      background: COLORS.primaryLight,
      color: COLORS.primary,
      padding: '8px 20px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '40px',
      border: `1px solid ${COLORS.primary}`
    },
    heroTitle: {
      fontSize: 'clamp(3rem, 5vw, 5rem)',
      fontWeight: '800',
      lineHeight: '1.1',
      marginBottom: '24px',
      color: COLORS.textDark
    },
    heroTitleHighlight: {
      background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.accent} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    heroSubtitle: {
      fontSize: 'clamp(1.5rem, 2.5vw, 2.5rem)',
      fontWeight: '600',
      color: COLORS.primary,
      marginBottom: '32px'
    },
    heroDescription: {
      fontSize: '18px',
      lineHeight: '1.8',
      color: COLORS.textLight,
      marginBottom: '48px'
    },
    heroButtons: {
      display: 'flex',
      gap: '20px',
      flexWrap: 'wrap'
    },
    primaryButton: {
      background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
      color: COLORS.textWhite,
      border: 'none',
      padding: '16px 36px',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 30px rgba(219, 168, 208, 0.4)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    secondaryButton: {
      background: 'transparent',
      color: COLORS.primary,
      border: `2px solid ${COLORS.primary}`,
      padding: '16px 36px',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    statsCard: {
      background: COLORS.cardBg,
      borderRadius: '24px',
      padding: '40px',
      border: `1px solid ${COLORS.border}`,
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05)'
    },
    statsHeader: {
      textAlign: 'center',
      marginBottom: '40px'
    },
    statsTitle: {
      fontSize: '28px',
      fontWeight: '700',
      marginBottom: '12px',
      color: COLORS.textDark
    },
    statsSubtitle: {
      color: COLORS.textLight,
      fontSize: '14px',
      letterSpacing: '1px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '24px'
    },
    statItem: {
      background: COLORS.background,
      borderRadius: '16px',
      padding: '24px',
      textAlign: 'center',
      border: `1px solid ${COLORS.border}`,
      transition: 'transform 0.3s ease, border-color 0.3s ease'
    },
    statNumber: {
      fontSize: '42px',
      fontWeight: '800',
      background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.accent} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '8px'
    },
    statLabel: {
      fontSize: '14px',
      color: COLORS.textLight,
      letterSpacing: '0.5px'
    },

    // Sections Common
    section: {
      padding: '120px 24px',
      position: 'relative',
      background: COLORS.background
    },
    sectionAlt: {
      background: '#F8F5FC'
    },
    sectionTitle: {
      fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: '20px',
      color: COLORS.textDark
    },
    sectionTitleHighlight: {
      background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.accent} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    sectionSubtitle: {
      fontSize: '18px',
      color: COLORS.textLight,
      textAlign: 'center',
      maxWidth: '600px',
      margin: '0 auto 60px',
      lineHeight: '1.6'
    },

    // About Section
    aboutGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '32px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    aboutCard: {
      background: COLORS.cardBg,
      borderRadius: '20px',
      padding: '40px',
      border: `1px solid ${COLORS.border}`,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden'
    },
    cardIcon: {
      fontSize: '40px',
      marginBottom: '24px',
      color: COLORS.primary
    },
    cardTitle: {
      fontSize: '24px',
      fontWeight: '700',
      marginBottom: '16px',
      color: COLORS.textDark
    },
    cardDescription: {
      color: COLORS.textLight,
      lineHeight: '1.7',
      fontSize: '16px'
    },

    // Achievements
    achievementsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px',
      maxWidth: '1200px',
      margin: '0 auto 80px'
    },
    achievementCard: {
      background: COLORS.cardBg,
      borderRadius: '16px',
      padding: '32px',
      border: `1px solid ${COLORS.border}`,
      transition: 'all 0.3s ease',
      textAlign: 'center'
    },
    achievementIcon: {
      fontSize: '40px',
      marginBottom: '20px',
      color: COLORS.primary
    },
    pillarsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    pillarCard: {
      background: COLORS.cardBg,
      borderRadius: '16px',
      padding: '32px',
      border: `1px solid ${COLORS.border}`,
      transition: 'all 0.3s ease',
      textAlign: 'center'
    },
    pillarLetter: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      fontWeight: '800',
      margin: '0 auto 20px',
      background: 'var(--pillar-color)',
      color: COLORS.textWhite
    },

    // Core Values
    valuesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    valueCard: {
      background: COLORS.cardBg,
      borderRadius: '16px',
      padding: '32px',
      border: `1px solid ${COLORS.border}`,
      transition: 'all 0.3s ease',
      display: 'flex',
      gap: '20px',
      alignItems: 'flex-start'
    },
    valueIcon: {
      fontSize: '28px',
      flexShrink: 0,
      color: COLORS.primary
    },

    // Publications
    publicationsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '40px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    featuredPublication: {
      background: COLORS.cardBg,
      borderRadius: '24px',
      padding: '40px',
      border: `1px solid ${COLORS.border}`,
      position: 'relative',
      overflow: 'hidden'
    },
    publicationHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    publicationBadge: {
      background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
      color: COLORS.textWhite,
      padding: '6px 16px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      letterSpacing: '0.5px'
    },
    publicationYear: {
      color: COLORS.textLight,
      fontSize: '14px'
    },
    publicationTitle: {
      fontSize: '28px',
      fontWeight: '700',
      marginBottom: '20px',
      lineHeight: '1.3',
      color: COLORS.textDark
    },
    publicationDescription: {
      color: COLORS.textLight,
      lineHeight: '1.8',
      marginBottom: '32px'
    },
    publicationActions: {
      display: 'flex',
      gap: '16px'
    },
    publicationsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    publicationItem: {
      background: COLORS.cardBg,
      borderRadius: '16px',
      padding: '24px',
      border: `1px solid ${COLORS.border}`,
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },

    // Contact CTA
    ctaSection: {
      background: `linear-gradient(135deg, ${COLORS.primaryLight} 0%, rgba(219, 168, 208, 0.1) 100%)`,
      borderRadius: '32px',
      padding: '80px',
      margin: '120px auto',
      maxWidth: '1200px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      border: `1px solid ${COLORS.primaryLight}`
    },
    ctaTitle: {
      fontSize: '3rem',
      fontWeight: '800',
      marginBottom: '24px',
      color: COLORS.textDark
    },
    ctaDescription: {
      fontSize: '18px',
      color: COLORS.textLight,
      maxWidth: '600px',
      margin: '0 auto 40px',
      lineHeight: '1.8'
    },

    // Footer
    footer: {
      background: COLORS.primary,
      color: COLORS.textWhite,
      padding: '80px 24px 40px',
      position: 'relative'
    },
    footerContent: {
      maxWidth: '1400px',
      margin: '0 auto'
    },
    footerMain: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '60px',
      marginBottom: '60px'
    },
    footerColumn: {
      display: 'flex',
      flexDirection: 'column'
    },
    footerColumnTitle: {
      fontSize: '16px',
      fontWeight: '700',
      color: COLORS.textWhite,
      marginBottom: '24px',
      letterSpacing: '1px'
    },
    footerLinks: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    footerLink: {
      color: 'rgba(255, 255, 255, 0.9)',
      textDecoration: 'none',
      fontSize: '14px',
      transition: 'all 0.3s ease',
      padding: '4px 0'
    },
    footerBottom: {
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      paddingTop: '40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '20px'
    },
    copyright: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: '14px'
    },
    socialLinks: {
      display: 'flex',
      gap: '20px'
    },
    loginButton: {
  background: 'transparent',
  border: '2px solid #dba8d0',
  color: '#dba8d0',
  padding: '10px 18px',
  borderRadius: '25px',
  cursor: 'pointer',
  fontWeight: 600,
  transition: 'all 0.3s ease',
}
    ,
    socialIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: COLORS.textWhite,
      textDecoration: 'none',
      transition: 'all 0.3s ease',
      fontSize: '18px'
    },

    // Responsive
    '@media (max-width: 1024px)': {
      heroContent: { gridTemplateColumns: '1fr', gap: '40px' },
      publicationsGrid: { gridTemplateColumns: '1fr' },
      ctaSection: { padding: '60px 40px', margin: '80px auto' },
      footerMain: { gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px' }
    },
    '@media (max-width: 768px)': {
      navLinks: { display: 'none' },
      mobileMenuButton: { display: 'block' },
      heroContent: { padding: '100px 20px 60px' },
      aboutGrid: { gridTemplateColumns: '1fr' },
      valuesGrid: { gridTemplateColumns: '1fr' },
      statsGrid: { gridTemplateColumns: '1fr' },
      footerMain: { gridTemplateColumns: '1fr', gap: '40px' },
      footerBottom: { flexDirection: 'column', textAlign: 'center' },
      ctaSection: { padding: '40px 24px', margin: '60px auto' }
    }
  };

  // Enhanced hover effects
  const hoverEffect = {
    transform: 'translateY(-8px)',
    borderColor: COLORS.primary,
    boxShadow: '0 20px 40px rgba(219, 168, 208, 0.15)'
  };

  const buttonHoverEffect = {
    transform: 'translateY(-2px) scale(1.02)',
    boxShadow: '0 12px 40px rgba(219, 168, 208, 0.6)'
  };

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
               <img src="/logo.png" alt="ORA Logo" style={{ width: '28px', height: '28px' }} />
            </div>
            <div style={styles.logoText}>
              <div style={styles.logoMain}>ORA RESEARCH</div>
              <div style={styles.logoSub}>OROMOO RESEARCH ASSOCIATION</div>
            </div>
          </div>
<div style={styles.navLinks}>
  {['home', 'about', 'achievements', 'values', 'publications', 'contact'].map((item) => (
    <a 
      key={item}
      href={`#${item}`}
      style={{
        ...styles.navLink,
        ...(activeSection === item ? styles.navLinkActive : {})
      }}
      onClick={(e) => {
        e.preventDefault();
        document.getElementById(item)?.scrollIntoView({ behavior: 'smooth' });
      }}
    >
      {item.charAt(0).toUpperCase() + item.slice(1)}
      {activeSection === item && <div style={styles.navIndicator} />}
    </a>
  ))}

  {/* Login Button */}
  <a href="/auth/login" style={styles.loginButton}>
    Login
  </a>

  {/* Join Button */}
  <button 
    style={styles.ctaButton}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 30px rgba(219, 168, 208, 0.4)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 20px rgba(219, 168, 208, 0.3)';
    }}
  >
    Join ORA
  </button>
</div>


          <button 
            style={styles.mobileMenuButton}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" style={styles.hero} ref={el => sectionsRef.current.home = el}>
        <div style={styles.heroContent}>
          <div style={styles.heroText}>
            <div style={styles.heroBadge}>
              <span style={{ animation: 'pulse 2s infinite', color: COLORS.primary }}>●</span>
              Preserving Oromoo Heritage Since 2022
            </div>
            <h1 style={styles.heroTitle}>
              <span style={{ display: 'block' }}>WALDAA</span>
              <span style={{ display: 'block', ...styles.heroTitleHighlight }}>QORANNOO</span>
              <span style={styles.heroSubtitle}>OROMOO</span>
            </h1>
            <p style={styles.heroDescription}>
              Towards enhancement of Oromoo values through rigorous research, 
              community engagement, and cultural preservation.
            </p>
            <div style={styles.heroButtons}>
              <button 
                style={styles.primaryButton}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, buttonHoverEffect)}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(219, 168, 208, 0.4)';
                }}
              >
                Explore Research →
              </button>
              <button 
                style={styles.secondaryButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = COLORS.primaryLight;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                View Publications
              </button>
            </div>
          </div>

          <div style={styles.statsCard}>
            <div style={styles.statsHeader}>
              <h2 style={styles.statsTitle}>ORA Impact Dashboard</h2>
              <p style={styles.statsSubtitle}>Real-time Research Impact Metrics</p>
            </div>
            <div style={styles.statsGrid}>
              {[
                { value: counters.books, label: 'Published Books' },
                { value: counters.researchers, label: 'Researchers Network' },
                { value: counters.cities, label: 'Cities Reached' },
                { value: counters.conferences, label: 'Conferences' }
              ].map((stat, index) => (
                <div 
                  key={index}
                  style={styles.statItem}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverEffect)}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = COLORS.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={styles.statNumber}>{stat.value}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={{...styles.section, ...styles.sectionAlt}} ref={el => sectionsRef.current.about = el}>
        <h2 style={styles.sectionTitle}>
          Our <span style={styles.sectionTitleHighlight}>Foundation</span>
        </h2>
        <p style={styles.sectionSubtitle}>
          Building excellence in Oromoo research through vision, mission, and strategic objectives
        </p>
        
        <div style={styles.aboutGrid}>
          {[
            {
              icon: '🎯',
              title: 'Our Vision',
              description: 'To become a leading center of excellence in advanced research on Oromoo.'
            },
            {
              icon: '🌍',
              title: 'Our Mission',
              description: 'Establishing a common platform for academicians and researchers to conduct Oromoo research.'
            },
            {
              icon: '⚡',
              title: 'Our Objectives',
              description: 'Synergize Oromoo studies and deconstruct old narratives while constructing grand narratives.'
            }
          ].map((item, index) => (
            <div 
              key={index}
              style={styles.aboutCard}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverEffect)}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = COLORS.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={styles.cardIcon}>{item.icon}</div>
              <h3 style={styles.cardTitle}>{item.title}</h3>
              <p style={styles.cardDescription}>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Achievements Section */}
      <section id="achievements" style={styles.section} ref={el => sectionsRef.current.achievements = el}>
        <h2 style={styles.sectionTitle}>
          Our <span style={styles.sectionTitleHighlight}>Achievements</span>
        </h2>
        <p style={styles.sectionSubtitle}>
          Milestones in preserving and promoting Oromoo heritage
        </p>
        
        <div style={styles.achievementsGrid}>
          {achievements.map((achievement, index) => (
            <div 
              key={index}
              style={styles.achievementCard}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverEffect)}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = COLORS.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={styles.achievementIcon}>{achievement.icon}</div>
              <h3 style={styles.cardTitle}>{achievement.title}</h3>
              <p style={styles.cardDescription}>{achievement.description}</p>
            </div>
          ))}
        </div>

        <h3 style={{...styles.sectionTitle, fontSize: '2.5rem', marginTop: '80px'}}>
          Strategic <span style={styles.sectionTitleHighlight}>Pillars</span>
        </h3>
        <div style={styles.pillarsGrid}>
          {strategicPillars.map((pillar, index) => (
            <div 
              key={index}
              style={styles.pillarCard}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverEffect)}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = COLORS.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{...styles.pillarLetter, '--pillar-color': pillar.color}}>
                {pillar.letter}
              </div>
              <h4 style={styles.cardTitle}>{pillar.title}</h4>
              <p style={styles.cardDescription}>{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Values */}
      <section id="values" style={{...styles.section, ...styles.sectionAlt}} ref={el => sectionsRef.current.values = el}>
        <h2 style={styles.sectionTitle}>
          Core <span style={styles.sectionTitleHighlight}>Values</span>
        </h2>
        <p style={styles.sectionSubtitle}>
          The principles guiding our research and community engagement
        </p>
        
        <div style={styles.valuesGrid}>
          {coreValues.map((value, index) => (
            <div 
              key={index}
              style={styles.valueCard}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverEffect)}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = COLORS.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={styles.valueIcon}>{value.icon}</div>
              <div>
                <h3 style={styles.cardTitle}>{value.title}</h3>
                <p style={styles.cardDescription}>{value.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Publications */}
      <section id="publications" style={styles.section} ref={el => sectionsRef.current.publications = el}>
        <h2 style={styles.sectionTitle}>
          Featured <span style={styles.sectionTitleHighlight}>Publications</span>
        </h2>
        <p style={styles.sectionSubtitle}>
          Landmark publications contributing to Oromoo studies
        </p>
        
        <div style={styles.publicationsGrid}>
          <div style={styles.featuredPublication}>
            <div style={styles.publicationHeader}>
              <span style={styles.publicationBadge}>FEATURED RESEARCH</span>
              <span style={styles.publicationYear}>2024</span>
            </div>
            <h3 style={styles.publicationTitle}>
              Finfinnee: Past and Present – A Counter-Hegemonic Discourse
            </h3>
            <p style={styles.publicationDescription}>
              A comprehensive analysis of the city's evolution, highlighting significant events 
              and cultural shifts through time. This groundbreaking research offers new perspectives 
              on Finfinnee's role in shaping Oromoo identity.
            </p>
            <div style={styles.publicationActions}>
              <button style={styles.primaryButton}>Download PDF</button>
              <button style={styles.secondaryButton}>Read Online</button>
            </div>
          </div>

          <div style={styles.publicationsList}>
            {publications.map((pub, index) => (
              <div 
                key={index}
                style={styles.publicationItem}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverEffect)}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = COLORS.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{fontSize: '24px', color: COLORS.primary}}>📚</div>
                <div style={{flex: 1}}>
                  <h4 style={{...styles.cardTitle, fontSize: '16px', marginBottom: '4px'}}>
                    {pub.title}
                  </h4>
                  <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                    <span style={{color: COLORS.textLight, fontSize: '14px'}}>{pub.year}</span>
                    <span style={{
                      background: COLORS.primaryLight,
                      color: COLORS.primary,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {pub.badge}
                    </span>
                  </div>
                </div>
                <div style={{fontSize: '20px', color: COLORS.primary}}>→</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div style={styles.ctaSection} id="contact" ref={el => sectionsRef.current.contact = el}>
        <h2 style={styles.ctaTitle}>Join Our Mission</h2>
        <p style={styles.ctaDescription}>
          Whether you're a researcher, academic, student, or community member, 
          there's a place for you in ORA's journey. Together, we can preserve 
          and promote Oromoo heritage for generations to come.
        </p>
        <button 
          style={{
            ...styles.primaryButton,
            padding: '20px 48px',
            fontSize: '18px'
          }}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, buttonHoverEffect)}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(219, 168, 208, 0.4)';
          }}
        >
          Become a Member Today →
        </button>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerMain}>
            {/* Column 1: Brand & Description */}
            <div style={styles.footerColumn}>
              <div style={{...styles.logo, color: COLORS.textWhite}}>
                <div style={{
                  ...styles.logoIcon,
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: COLORS.textWhite
                }}>ORA</div>
                <div style={styles.logoText}>
                  <div style={{...styles.logoMain, color: COLORS.textWhite}}>ORA RESEARCH</div>
                  <div style={{...styles.logoSub, color: 'rgba(255, 255, 255, 0.9)'}}>
                    OROMOO RESEARCH ASSOCIATION
                  </div>
                </div>
              </div>
              <p style={{...styles.cardDescription, marginTop: '20px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)'}}>
                Towards enhancement of Oromoo values through research, 
                preservation, and community engagement since 2022.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div style={styles.footerColumn}>
              <h4 style={styles.footerColumnTitle}>QUICK LINKS</h4>
              <div style={styles.footerLinks}>
                {footerLinks['Quick Links'].map((link, index) => (
                  <a 
                    key={index}
                    href={`#${link.toLowerCase()}`}
                    style={styles.footerLink}
                    onMouseEnter={(e) => e.currentTarget.style.color = COLORS.textWhite}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Column 3: Resources */}
            <div style={styles.footerColumn}>
              <h4 style={styles.footerColumnTitle}>RESOURCES</h4>
              <div style={styles.footerLinks}>
                {footerLinks['Resources'].map((link, index) => (
                  <a 
                    key={index}
                    href="#"
                    style={styles.footerLink}
                    onMouseEnter={(e) => e.currentTarget.style.color = COLORS.textWhite}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Column 4: Connect */}
            <div style={styles.footerColumn}>
              <h4 style={styles.footerColumnTitle}>CONNECT</h4>
              <div style={styles.footerLinks}>
                {footerLinks['Connect'].map((link, index) => (
                  <a 
                    key={index}
                    href="#"
                    style={styles.footerLink}
                    onMouseEnter={(e) => e.currentTarget.style.color = COLORS.textWhite}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div style={styles.footerBottom}>
            <div style={styles.copyright}>
              © {new Date().getFullYear()} Oromoo Research Association. All rights reserved.<br />
              Licensed by Oromia Justice & Attorney General's Office
            </div>
            <div style={styles.socialLinks}>
              {['twitter', 'linkedin', 'facebook', 'instagram'].map((platform) => (
                <a 
                  key={platform}
                  href="#"
                  style={styles.socialIcon}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {platform === 'twitter' ? '𝕏' : platform.charAt(0).toUpperCase()}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Add keyframes animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default Landing;