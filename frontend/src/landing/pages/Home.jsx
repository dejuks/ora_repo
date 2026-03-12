import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import ModuleCard from "../components/ModuleCard";
import MissionVision from "../components/MissionVision";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />

      <HeroSection
        title="Oromo Association Digital Portal"
        subtitle="Empowering Knowledge, Preserving Culture, Connecting Researchers"
      />

      <div style={styles.moduleSection}>
        <ModuleCard title="Journal Management" link="/journal" />
        <ModuleCard title="Repository Management" link="/repository" />
        <ModuleCard title="Ebooks" link="/ebooks" />
        <ModuleCard title="Library Management" link="/library" />
        <ModuleCard title="Researcher Network" link="/network" />
        <ModuleCard title="Oromo Wikipedia" link="/wikipedia" />
      </div>

      <MissionVision />
      <Footer />
    </>
  );
}

const styles = {
  moduleSection: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    padding: "50px",
  },
};
