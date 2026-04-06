import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getPublicItem,
  trackView,
  trackDownload,
} from "../../../api/publicRepository.api";
import { cleanHtml } from "../../../utils/cleanHtml";
import { FiEye, FiDownload, FiCalendar, FiFileText } from "react-icons/fi";
import "../publicUsers/repository.css";
import Navbar from "../../../landing/components/Navbar";

export default function PublicRepositoryDetail() {
  const { uuid } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);

        const res = await getPublicItem(uuid);

        // support multiple response shapes
        const record = res?.item || res?.data || res;

        if (!active) return;

        setItem({
          ...record,
          views: Number(record?.views ?? 0),
          downloads: Number(record?.downloads ?? 0),
        });

        try {
          const viewRes = await trackView(uuid);
          const nextViews =
            Number(viewRes?.views ?? viewRes?.data?.views ?? 0);

          if (!active) return;

          setItem((prev) =>
            prev
              ? {
                  ...prev,
                  views: nextViews,
                }
              : prev
          );
        } catch (err) {
          console.error("trackView failed:", err);
        }
      } catch (err) {
        console.error("getPublicItem failed:", err);
        if (active) setItem(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [uuid]);

  const year = useMemo(() => {
    if (!item?.created_at) return "";
    const d = new Date(item.created_at);
    return Number.isNaN(d.getTime()) ? "" : d.getFullYear();
  }, [item]);

  const authorText = useMemo(() => {
    if (!item) return "Unknown Author";

    if (Array.isArray(item.authors) && item.authors.length > 0) {
      return item.authors.join(", ");
    }

    if (typeof item.authors === "string" && item.authors.trim()) {
      return item.authors;
    }

    if (typeof item.author === "string" && item.author.trim()) {
      return item.author;
    }

    if (typeof item.creator === "string" && item.creator.trim()) {
      return item.creator;
    }

    return "Unknown Author";
  }, [item]);

  const citation = useMemo(() => {
    if (!item) return "";

    const title = item.title || "Untitled";
    const citationYear = year || "n.d.";

    return `${authorText}. ${title}. (${citationYear})`;
  }, [item, authorText, year]);

  const handleDownload = async () => {
    try {
      const res = await trackDownload(uuid);
      const nextDownloads =
        Number(res?.downloads ?? res?.data?.downloads ?? 0);

      setItem((prev) =>
        prev
          ? {
              ...prev,
              downloads: nextDownloads,
            }
          : prev
      );
    } catch (err) {
      console.error("trackDownload failed:", err);
    }
  };

  if (loading) {
    return (
      <section className="repo-detail">
        <div className="container detail-card">
          <p>Loading...</p>
        </div>
      </section>
    );
  }

  if (!item) {
    return (
      <section className="repo-detail">
        <div className="container detail-card">
          <h2>Item not found</h2>
          <p>The repository item could not be loaded.</p>
        </div>
      </section>
    );
  }

  return (
    <> <Navbar />
    <section className="repo-detail">
      <div className="container detail-card">
        <h1>{item.title || "Untitled"}</h1>

        <p className="detail-meta">
          <FiFileText /> {item.item_type || "Repository Item"}
          {year ? (
            <>
              &nbsp; • &nbsp;
              <FiCalendar /> {year}
            </>
          ) : null}
        </p>

        <div className="detail-stats">
          <span>
            <FiEye /> {Number(item.views ?? 0)}
          </span>
          <span>
            <FiDownload /> {Number(item.downloads ?? 0)}
          </span>
        </div>

        <hr />

        <h3>Abstract</h3>
        <p className="detail-abstract">
          {item.abstract ? cleanHtml(item.abstract) : "No abstract available."}
        </p>

        <h3>Citation</h3>
        <code className="citation">{citation}</code>

        {item.file_path && (
          <a
            href={item.file_path}
            onClick={handleDownload}
            target="_blank"
            rel="noreferrer"
            className="btn-download big"
          >
            ⬇ Download
          </a>
        )}
      </div>
    </section>
    </>
  );
}