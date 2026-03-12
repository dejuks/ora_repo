import { Link } from "react-router-dom";
import "./ModuleCard.css";

export default function ModuleCard({ title, link, description, stats, badge }) {
  const moduleIcons = {
    "Journal Management": "📚",
   "Repository Management": "🗂️",
    "Ebooks": "📖",
    "Library Management": "🏛️",
    "Researcher Network": "🌐",
    "Oromo Wikipedia": "📝",
  };

  return (
    <Link to={link} className="module-card">
      <div className="icon">
        {moduleIcons[title]}
      </div>

      {badge && <span className="badge">{badge}</span>}

      <h3>{title}</h3>

      {description && <p>{description}</p>}

      {stats && <div className="stats">{stats}</div>}
    </Link>
  );
}
