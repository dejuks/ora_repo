import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getPublicItem,
  trackView,
  trackDownload,
} from "../../../api/publicRepository.api";
import { cleanHtml } from "../../../utils/cleanHtml";
import { FiEye, FiDownload, FiCalendar, FiFileText } from "react-icons/fi";
import "../publicUsers/repository.css";

export default function PublicRepositoryDetail() {
  const { uuid } = useParams();
  const [item, setItem] = useState(null);

useEffect(() => {
  const load = async () => {
    const res = await getPublicItem(uuid);
    setItem(res.data);

    trackView(uuid).then(r => {
      setItem(prev => ({ ...prev, views: r.data.views }));
    });
  };

  load();
}, [uuid]);


  if (!item) return null;

  return (
    <section className="repo-detail">
      <div className="container detail-card">
        <h1>{item.title}</h1>

        <p className="detail-meta">
          <FiFileText /> {item.item_type} &nbsp; • &nbsp;
          <FiCalendar /> {new Date(item.created_at).getFullYear()}
        </p>

        <div className="detail-stats">
          <span><FiEye /> {item.views}</span>
          <span><FiDownload /> {item.downloads}</span>
        </div>

        <hr />

        <h3>Abstract</h3>
        <p className="detail-abstract">
          {cleanHtml(item.abstract)}
        </p>

        <h3>Citation</h3>
        <code className="citation">
          {item.authors}. {item.title}. ({item.year})
        </code>

        {item.file_path && (
          <a
            href={item.file_path}
            onClick={() => trackDownload(uuid)}
            target="_blank"
            rel="noreferrer"
            className="btn-download big"
          >
            ⬇ Download
          </a>
        )}
      </div>
    </section>
  );
}
