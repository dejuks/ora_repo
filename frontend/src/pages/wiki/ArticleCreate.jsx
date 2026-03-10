import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import MainLayout from "../../components/layout/MainLayout";
import ArticleForm from "../wiki/ArticleForm";
import { createArticle } from "../../api/wikiArticle.api";

export default function ArticleCreate() {
  const navigate = useNavigate();

  const submit = async (data) => {
    try {
      await createArticle(data);

      Swal.fire({
        title: "Created!",
        text: "Article created successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/wiki/articles");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to create article", "error");
    }
  };

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">

          <div className="row mb-3">
            <div className="col-md-12">
              <h1 className="m-0 text-dark">
                <i className="fas fa-plus-circle mr-2 text-primary"></i>
                Create Wiki Article
              </h1>
            </div>
          </div>

          <div className="card card-primary card-outline">
            <div className="card-header">
              <h3 className="card-title">Article Information</h3>
            </div>

            <div className="card-body">
              <ArticleForm onSubmit={submit} />
            </div>
          </div>

        </div>
      </section>
    </MainLayout>
  );
}
