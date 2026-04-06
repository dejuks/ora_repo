import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import MainLayout from "../../components/layout/MainLayout";
import { getArticle, updateArticle } from "../../api/wikiArticle.api";
import ArticleForm from "../wiki/ArticleForm";

export default function ArticleEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const res = await getArticle(id);
      const articleData = res.data?.data || res.data;
      setData(articleData);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load article", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchArticle();
    }
  }, [id]);

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
      <section className="content pt-3">
        <div className="container-fluid">
          <div className="row mb-3">
            <div className="col-sm-8">
              <h1 className="m-0 text-dark">
                <i className="fas fa-edit mr-2 text-primary"></i>
                Edit Wiki Article
              </h1>
              <p className="text-muted mb-0">
                Update article information and save your changes
              </p>
            </div>

            <div className="col-sm-4 text-sm-right mt-2 mt-sm-0">
              <Link to="/wiki/articles" className="btn btn-secondary">
                <i className="fas fa-arrow-left mr-1"></i>
                Back to List
              </Link>
            </div>
          </div>

          <div className="card card-primary card-outline">
            <div className="card-header">
              <h3 className="card-title">Article Information</h3>
            </div>

            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <i className="fas fa-spinner fa-spin fa-2x text-primary mb-3"></i>
                  <p className="mb-0">Loading article...</p>
                </div>
              ) : data ? (
                <ArticleForm initialData={data} onSubmit={submit} />
              ) : (
                <div className="alert alert-danger mb-0">
                  Article not found.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}