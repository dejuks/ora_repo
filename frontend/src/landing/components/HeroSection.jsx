import { useState, useEffect } from 'react';

export default function HeroSection({ title, subtitle }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "/oromo-bg.jpg",
      title: "Oromo Researcher Association",
      subtitle: "Preserving Knowledge, Advancing Research, Celebrating Culture",
      color: "linear-gradient(135deg, rgba(15,61,46,0.9), rgba(201,162,39,0.7))"
    },
    {
      image: "/oromo-bg2.jpg",
      title: "Empowering Oromo Scholars",
      subtitle: "Connecting Researchers Worldwide for Collaborative Excellence",
      color: "linear-gradient(135deg, rgba(201,162,39,0.8), rgba(15,61,46,0.9))"
    },
    {
      image: "/oromo-bg3.jpg",
      title: "Cultural Heritage & Innovation",
      subtitle: "Bridging Traditional Knowledge with Modern Research",
      color: "linear-gradient(135deg, rgba(15,61,46,0.85), rgba(123,31,162,0.6))"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div style={styles.container}>
      {slides.map((slide, index) => (
        <div
          key={index}
          style={{
            ...styles.hero,
            background: `${slide.color}, url('${slide.image}') center/cover no-repeat`,
            opacity: index === currentSlide ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        >
          <div style={styles.overlay}>
            <div style={styles.content}>
              <h1 style={styles.title}>
                {index === currentSlide ? slide.title : title}
              </h1>
              <p style={styles.subtitle}>
                {index === currentSlide ? slide.subtitle : subtitle}
              </p>
              <div style={styles.buttonGroup}>
                <button style={styles.primaryButton}>Explore Research</button>
                <button style={styles.secondaryButton}>Join Association</button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Slider Navigation Dots */}
      <div style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <button
            key={index}
            style={{
              ...styles.dot,
              backgroundColor: index === currentSlide ? '#C9A227' : 'rgba(255,255,255,0.5)',
              transform: index === currentSlide ? 'scale(1.2)' : 'scale(1)'
            }}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>

      {/* Slider Arrows */}
      <button 
        style={styles.arrowLeft}
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
      >
        ←
      </button>
      <button 
        style={styles.arrowRight}
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
      >
        →
      </button>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    height: '80vh',
    overflow: 'hidden'
  },
  hero: {
    height: '100%',
    width: '100%',
    position: 'relative'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '20px'
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    animation: 'fadeInUp 1s ease-out'
  },
  title: {
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    color: 'white',
    marginBottom: '1rem',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    fontWeight: 'bold',
    letterSpacing: '1px'
  },
  subtitle: {
    fontSize: 'clamp(1rem, 2vw, 1.3rem)',
    color: 'rgba(255,255,255,0.95)',
    marginBottom: '2rem',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
    lineHeight: 1.6
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  primaryButton: {
    padding: '12px 30px',
    background: '#C9A227',
    color: '#0F3D2E',
    border: '2px solid #C9A227',
    borderRadius: '50px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(201,162,39,0.3)'
  },
  secondaryButton: {
    padding: '12px 30px',
    background: 'transparent',
    color: 'white',
    border: '2px solid white',
    borderRadius: '50px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  dotsContainer: {
    position: 'absolute',
    bottom: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '12px',
    zIndex: 10
  },
  dot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    padding: 0
  },
  arrowLeft: {
    position: 'absolute',
    left: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    fontSize: '20px',
    color: 'white',
    cursor: 'pointer',
    backdropFilter: 'blur(5px)',
    transition: 'all 0.3s ease',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  arrowRight: {
    position: 'absolute',
    right: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    fontSize: '20px',
    color: 'white',
    cursor: 'pointer',
    backdropFilter: 'blur(5px)',
    transition: 'all 0.3s ease',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

// Add these keyframes to your global CSS
const globalStyles = `
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