import { useNavigate } from "react-router-dom";
import { FiEye, FiDownload, FiFileText } from "react-icons/fi";
import { trackDownload } from "../../../api/publicRepository.api";
import { cleanHtml } from "../../../utils/cleanHtml";

export default function ItemCard({ item }) {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/repository/${item.uuid}`);
  };
const handleDownload = async () => {
  const res = await trackDownload(item.uuid);

  item.downloads = res.data.downloads; // optimistic UI
  window.open(item.file_path, "_blank");
};




  return (
    <div className="repo-card">
      <div className="repo-card-header">
        <FiFileText className="repo-icon" />
        <span className="repo-type">{item.item_type}</span>
      </div>

      <h4 className="repo-title">{item.title}</h4>

      <p className="repo-meta">
        {item.authors} • {new Date(item.created_at).getFullYear()}
      </p>

      <p className="repo-abstract">
        {cleanHtml(item.abstract)?.slice(0, 140)}…
      </p>

      <div className="repo-stats">
        <span><FiEye /> {item.views || 0}</span>
        <span><FiDownload /> {item.downloads || 0}</span>
      </div>

      <div className="repo-actions">
        <button className="btn-view" onClick={handleView}>
          View details
        </button>
        {item.file_path && (
         <a
  href="#"
  onClick={handleDownload}
  className="btn-download  btn-sm btn-outline-secondary">
  ⬇ Download 
</a>
        )}
      </div>
    </div>
  );
}
