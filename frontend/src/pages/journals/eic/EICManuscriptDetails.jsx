import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import { getEICManuscriptDetailsAPI } from "../../../api/odl_manuscript.api";

export default function EICManuscriptDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [manuscript, setManuscript] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ✅ Normalize keywords safely */
  const normalizeKeywords = (keywords) => {
    if (!keywords) return [];

    if (Array.isArray(keywords)) return keywords;

    if (typeof keywords === "string") {
      try {
        const parsed = JSON.parse(keywords);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return keywords.split(",").map((k) => k.trim());
      }
    }

    return [];
  };

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const result = await getEICManuscriptDetailsAPI(id);
        const manuscriptData = result?.data ?? result;

        /* ✅ normalize keywords BEFORE setState */
        if (manuscriptData) {
          manuscriptData.keywords = normalizeKeywords(
            manuscriptData.keywords
          );
        }

        setManuscript(manuscriptData || null);
      } catch (err) {
        console.error("Failed to load manuscript:", err);
        setManuscript(null);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <p className="text-center mt-3">Loading manuscript details...</p>
      </MainLayout>
    );
  }

  if (!manuscript) {
    return (
      <MainLayout>
        <p className="text-center text-danger mt-3">
          Manuscript not found or failed to load.
        </p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-fluid mt-3">
        <div className="card card-primary card-outline">
          <div className="card-header d-flex justify-content-between">
            <h3 className="card-title">Manuscript Details</h3>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
          </div>

          <div className="card-body">
            <h4 className="mb-3">{manuscript.title}</h4>

            <p><strong>Journal:</strong> {manuscript.journal_title}</p>

            <p>
              <strong>Status:</strong>{" "}
              <span className="badge badge-info">
                {manuscript.status_label}
              </span>
            </p>

            <p>
              <strong>Screening:</strong>{" "}
              {manuscript.screening_status ? (
                <span
                  className={`badge badge-${
                    manuscript.screening_status === "passed"
                      ? "success"
                      : manuscript.screening_status === "failed"
                      ? "danger"
                      : "warning"
                  }`}
                >
                  {manuscript.screening_status}
                </span>
              ) : (
                "N/A"
              )}
            </p>

            <p>
              <strong>Submitted At:</strong>{" "}
              {new Date(manuscript.created_at).toLocaleString()}
            </p>

            {manuscript.abstract && (
              <>
                <hr />
                <h5>Abstract</h5>
                <p>{manuscript.abstract}</p>
              </>
            )}

            {manuscript.authors?.length > 0 && (
              <>
                <hr />
                <h5>Authors</h5>
                <ul>
                  {manuscript.authors.map((a) => (
                    <li key={a.id}>
                      {a.name} {a.affiliation && `(${a.affiliation})`}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {manuscript.keywords?.length > 0 && (
              <p>
                <strong>Keywords:</strong>{" "}
                {manuscript.keywords.join(", ")}
              </p>
            )}

            {manuscript.files?.length > 0 && (
              <>
                <hr />
                <h5>Files</h5>
                <ul>
                  {manuscript.files.map((f, idx) => (
                    <li key={idx}>
                      <a href={f.url} target="_blank" rel="noopener noreferrer">
                        {f.name || `File ${idx + 1}`}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
