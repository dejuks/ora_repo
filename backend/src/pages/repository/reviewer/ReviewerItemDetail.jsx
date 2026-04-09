import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import { getReviewerItemDetail } from "../../../api/repository.api";
import Swal from "sweetalert2";

export default function ReviewerItemDetail() {
  const { uuid } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItem = async () => {
      try {
        const res = await getReviewerItemDetail(uuid);
        setItem(res.data);
      } catch {
        Swal.fire("Error", "Failed to load item", "error");
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [uuid]);

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-5">
          <i className="fas fa-spinner fa-spin"></i> Loading...
        </div>
      </MainLayout>
    );
  }

  if (!item) return null;

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">
          <div className="card card-primary card-outline">
            <div className="card-header">
              <h3 className="card-title">
                <i className="fas fa-file-alt mr-2"></i>
                Repository Item Review
              </h3>
            </div>

            <div className="card-body">
              <h4>{item.title}</h4>

              <p className="text-muted">
                <strong>Type:</strong> {item.item_type} <br />
                <strong>Status:</strong> {item.status} <br />
                <strong>Submitted:</strong>{" "}
                {new Date(item.created_at).toLocaleDateString()}
              </p>

              <hr />

              <h5>Abstract</h5>
              <p>{item.abstract || "No abstract provided"}</p>

              {item.file_path && (
                <>
                  <hr />
                  <a
                    href={item.file_path}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-primary"
                  >
                    <i className="fas fa-download mr-1"></i>
                    Download File
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
