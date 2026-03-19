import { useState, useEffect } from "react";
import { createCategory, getCategory, updateCategory } from "../../api/wikiCategory.api";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import Swal from "sweetalert2";

export default function WikiCategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    if (id) {
      getCategory(id).then(res => setForm(res.data));
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) await updateCategory(id, form);
      else await createCategory(form);
      Swal.fire("Success", "Category saved successfully", "success");
      navigate("/wiki/categories");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save category", "error");
    }
  };

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid mt-4">

          <div className="card card-warning card-outline">
            <div className="card-header">
              <h3 className="card-title">
                <i className="fas fa-th-list mr-2"></i>
                {id ? "Edit Category" : "New Category"}
              </h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="card-body">

                {/* NAME */}
                <div className="form-group">
                  <label>
                    <i className="fas fa-heading mr-1 text-primary"></i>
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Enter category name..."
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* DESCRIPTION */}
                <div className="form-group">
                  <label>
                    <i className="fas fa-align-left mr-1 text-info"></i>
                    Description
                  </label>
                  <textarea
                    name="description"
                    className="form-control"
                    placeholder="Enter category description..."
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>

              </div>

              {/* CARD FOOTER */}
              <div className="card-footer d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate("/wiki-categories")}
                >
                  <i className="fas fa-arrow-left mr-1"></i>
                  Cancel
                </button>
                <button type="submit" className="btn btn-warning">
                  <i className="fas fa-save mr-1"></i>
                  {id ? "Update Category" : "Create Category"}
                </button>
              </div>

            </form>
          </div>

        </div>
      </section>
    </MainLayout>
  );
}
