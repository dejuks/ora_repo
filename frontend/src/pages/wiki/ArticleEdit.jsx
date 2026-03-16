import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import MainLayout from "../../components/layout/MainLayout";
import { getArticle, updateArticle } from "../../api/wikiArticle.api";
import ArticleForm from "../wiki/ArticleForm";

export default function ArticleEdit() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* ================= FETCH ARTICLE ================= */
  const fetchArticle = async () => {
    try {
      const res = await getArticle(id);
      setData(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load article", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticle();
  }, []);

  /* ================= UPDATE ================= */
  const submit = async (form) => {
    try {
      await updateArticle(id, form);

      Swal.fire({
        title: "Updated!",
        text: "Article updated successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/wiki/articles");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update article", "error");
    }
  };

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">

          {/* HEADER */}
          <div className="row mb-3">
            <div className="col-md-8">
              <h1 className="m-0 text-dark">
                <i className="fas fa-edit mr-2 text-info"></i>
                Edit Wiki Article
              </h1>
              <p className="text-muted">
                Modify article details and publication status
              </p>
            </div>

            <div className="col-md-4 text-right">
              <Link to="/wiki" className="btn btn-secondary">
                <i className="fas fa-arrow-left mr-1"></i>
                Back to List
              </Link>
            </div>
          </div>

          {/* FORM CARD */}
          <div className="card card-info card-outline">
            <div className="card-body">

              {loading ? (
                <div className="text-center py-5">
                  <i className="fas fa-spinner fa-spin fa-2x text-info mb-3"></i>
                  <p>Loading article...</p>
                </div>
              ) : (
                <ArticleForm
                  initialData={data}
                  onSubmit={submit}
                />
              )}

            </div>
          </div>

        </div>
      </section>
    </MainLayout>
  );
}
