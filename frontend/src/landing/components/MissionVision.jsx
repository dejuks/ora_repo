import React from "react";
import { useInView } from "react-intersection-observer";

export default function MissionVision() {
  const { ref: sectionRef, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  // Define colors directly in the component
  const colors = {
    primaryGreen: "#0A5C36",      // Dark green from ORA logo
    secondaryGreen: "#14452F",     // Medium green
    accentGold: "#C4A24B",         // Gold from ORA logo
    lightGold: "#D4B45C",          // Lighter gold
    cream: "#F5F0E6",              // Smoke white/cream background
    white: "#FFFFFF",
    smokeWhite: "#F8F4ED",         // Smoke white
    lightSmoke: "#FAF7F2",         // Lighter smoke
    darkSmoke: "#E8E2D6",          // Darker smoke for contrast
  };

  const missionData = {
    title: "Our Mission & Vision",
    subtitle: "Guiding Principles of Oromo Researcher Association",
    mission: {
      icon: "🎯",
      title: "Our Mission",
      description: "To preserve, promote, and digitalize Oromo knowledge, culture, and research globally through innovative technology and collaborative partnerships.",
      points: [
        "Digital preservation of Oromo historical documents",
        "Promoting Oromo language and literature",
        "Supporting Oromo researchers worldwide",
        "Building bridges between traditional and modern knowledge"
      ]
    },
    vision: {
      icon: "👁️",
      title: "Our Vision",
      description: "To become the leading global platform for Oromo academic and cultural resources, fostering a connected community of scholars and preserving heritage for future generations.",
      points: [
        "Global recognition of Oromo scholarship",
        "Sustainable knowledge ecosystem",
        "Intergenerational knowledge transfer",
        "Cultural sovereignty through education"
      ]
    }
  };

  return (
    <section 
      ref={sectionRef}
      style={styles.section(colors)}
      className={inView ? 'fade-in' : ''}
    >
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.badge(colors)}>Our Foundation</span>
          <h2 style={styles.title(colors)}>
            {missionData.title}
          </h2>
          <p style={styles.subtitle}>{missionData.subtitle}</p>
        </div>

        {/* Mission & Vision Cards */}
        <div style={styles.cardsContainer}>
          {/* Mission Card */}
          <div style={styles.card(colors)}>
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon(colors)}>{missionData.mission.icon}</span>
              <h3 style={styles.cardTitle(colors)}>{missionData.mission.title}</h3>
            </div>
            
            <p style={styles.cardDescription}>{missionData.mission.description}</p>
            
            <ul style={styles.pointsList}>
              {missionData.mission.points.map((point, index) => (
                <li key={index} style={styles.pointItem(colors)}>
                  <span style={styles.pointBullet(colors)}>✓</span>
                  {point}
                </li>
              ))}
            </ul>

            {/* Decorative Elements */}
            <div style={styles.cardPattern(colors)} />
          </div>

          {/* Vision Card */}
          <div style={styles.card(colors)}>
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon(colors)}>{missionData.vision.icon}</span>
              <h3 style={styles.cardTitle(colors)}>{missionData.vision.title}</h3>
            </div>
            
            <p style={styles.cardDescription}>{missionData.vision.description}</p>
            
            <ul style={styles.pointsList}>
              {missionData.vision.points.map((point, index) => (
                <li key={index} style={styles.pointItem(colors)}>
                  <span style={styles.pointBullet(colors)}>✓</span>
                  {point}
                </li>
              ))}
            </ul>

            {/* Decorative Elements */}
            <div style={styles.cardPattern(colors)} />
          </div>
        </div>

        {/* Stats Highlight */}
        <div style={styles.statsContainer(colors)}>
          <div style={styles.statItem}>
            <span style={styles.statNumber(colors)}>15+</span>
            <span style={styles.statLabel}>Years of Service</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statNumber(colors)}>5000+</span>
            <span style={styles.statLabel}>Researchers</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statNumber(colors)}>45+</span>
            <span style={styles.statLabel}>Countries</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statNumber(colors)}>120+</span>
            <span style={styles.statLabel}>Projects</span>
          </div>
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: (colors) => ({
    padding: "100px 20px",
    background: colors.smokeWhite,
    position: "relative",
    overflow: "hidden",
  }),
  
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },
  
  header: {
    textAlign: "center",
    marginBottom: "60px",
  },
  
  badge: (colors) => ({
    display: "inline-block",
    padding: "8px 20px",
    background: colors.cream,
    borderRadius: "30px",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: colors.primaryGreen,
    marginBottom: "20px",
    border: `1px solid ${colors.accentGold}`,
  }),
  
  title: (colors) => ({
    fontSize: "clamp(2rem, 5vw, 3rem)",
    fontWeight: "700",
    color: colors.primaryGreen,
    margin: "0 0 15px",
    position: "relative",
    display: "inline-block",
  }),
  
  subtitle: {
    fontSize: "1.1rem",
    color: "#5a6a7a",
    maxWidth: "600px",
    margin: "0 auto",
  },
  
  cardsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "40px",
    marginBottom: "60px",
  },
  
  card: (colors) => ({
    background: colors.white,
    borderRadius: "30px",
    padding: "40px",
    boxShadow: `0 20px 40px ${colors.darkSmoke}`,
    border: `1px solid ${colors.cream}`,
    position: "relative",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    "&:hover": {
      transform: "translateY(-10px)",
      boxShadow: `0 30px 60px ${colors.accentGold}40`,
    },
  }),
  
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "25px",
  },
  
  cardIcon: (colors) => ({
    fontSize: "2.5rem",
    background: colors.cream,
    width: "60px",
    height: "60px",
    borderRadius: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),
  
  cardTitle: (colors) => ({
    fontSize: "1.8rem",
    fontWeight: "700",
    color: colors.primaryGreen,
    margin: 0,
  }),
  
  cardDescription: {
    fontSize: "1rem",
    lineHeight: 1.8,
    color: "#5a6a7a",
    marginBottom: "25px",
  },
  
  pointsList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  
  pointItem: (colors) => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
    fontSize: "0.95rem",
    color: "#2d3748",
  }),
  
  pointBullet: (colors) => ({
    color: colors.accentGold,
    fontWeight: "bold",
    fontSize: "1.1rem",
  }),
  
  cardPattern: (colors) => ({
    position: "absolute",
    bottom: "20px",
    right: "20px",
    fontSize: "5rem",
    opacity: 0.05,
    pointerEvents: "none",
    color: colors.primaryGreen,
    content: '"✧"',
  }),
  
  statsContainer: (colors) => ({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "20px",
    background: colors.white,
    borderRadius: "20px",
    padding: "30px",
    border: `1px solid ${colors.cream}`,
  }),
  
  statItem: {
    textAlign: "center",
  },
  
  statNumber: (colors) => ({
    display: "block",
    fontSize: "2rem",
    fontWeight: "700",
    color: colors.accentGold,
    marginBottom: "5px",
  }),
  
  statLabel: {
    fontSize: "0.9rem",
    color: "#5a6a7a",
  },
};

// Add global styles
const globalStyles = `
  .fade-in {
    animation: fadeInUp 0.8s ease forwards;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = globalStyles;
  document.head.appendChild(style);
}