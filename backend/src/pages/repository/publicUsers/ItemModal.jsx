import { useEffect, useState } from "react";
import {
  getPublicItem,
  trackView,
  trackDownload,
  rateItem,
} from "../../../api/publicRepository.api";
import { cleanHtml } from "../../../utils/cleanHtml";
import {
  FiX,
  FiDownload,
  FiEye,
  FiStar,
} from "react-icons/fi";

export default function ItemModal({ uuid, onClose }) {
  const [item, setItem] = useState(null);
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await getPublicItem(uuid);
      setItem(res.data);
      await trackView(uuid);
    };
    load();
  }, [uuid]);

  const handleRate = async (value) => {
    setRating(value);
    setSubmitting(true);
    try {
      await rateItem(uuid, value);
    } finally {
      setSubmitting(false);
    }
  };

  if (!item) return null;

  return (
    <div className="repo-modal-overlay">
      <div className="repo-modal-card">
        {/* HEADER */}
        <div className="modal-header">
          <h2>{item.title}</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* META */}
        <div className="modal-meta">
          <span>{item.item_type}</span>
          <span>•</span>
          <span>{item.year}</span>
          <span className="views">
            <FiEye /> {item.views || 0}
          </span>
        </div>

        {/* ABSTRACT */}
        <div className="modal-section">
          <h4>Abstract</h4>
          <p className="abstract">
            {cleanHtml(item.abstract)}
          </p>
        </div>

        {/* CITATION */}
        <div className="modal-section citation">
          <h4>Citation</h4>
          <code>
            {item.authors}. <i>{item.title}</i>. ({item.year})
          </code>
        </div>

        {/* ACTIONS */}
        <div className="modal-actions">
          {/* RATING */}
          <div className="rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                className={`star ${rating >= n ? "active" : ""}`}
                disabled={submitting}
                onClick={() => handleRate(n)}
                aria-label={`Rate ${n} stars`}
              >
                <FiStar />
              </button>
            ))}
          </div>

          {/* DOWNLOAD */}
          {item.file_path && (
            <a
              href={item.file_path}
              onClick={() => trackDownload(uuid)}
              target="_blank"
              rel="noreferrer"
              className="download-btn"
            >
              <FiDownload /> Download PDF
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
