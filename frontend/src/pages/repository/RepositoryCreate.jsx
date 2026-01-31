import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import MainLayout from "../../components/layout/MainLayout";
import { createItem } from "../../api/repository.api";

// CKEditor
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default function RepositoryCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    abstract: "",
    item_type: "article",
    language: "en",
    doi: "",
    handle: "",
    access_level: "open",
    embargo_until: "",
    status: "draft" // ✅ DEFAULT
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // ===============================
  // HANDLE INPUT CHANGE
  // ===============================
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "file") {
      setFile(files[0]);
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // ===============================
  // SUBMIT FORM
  // ===============================
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          formData.append(key, value);
        }
      });

      if (file) {
        formData.append("file", file);
      }

      await createItem(formData);

      Swal.fire({
        icon: "success",
        title: "Success",
        text:
          form.status === "draft"
            ? "Draft saved successfully"
            : "Item submitted for curator review",
        timer: 1500,
        showConfirmButton: false
      });

      navigate("/repository");

    } catch (error) {
      console.error(error);

      if (error.response?.status === 409) {
        const item = error.response.data.existing_item;

        Swal.fire({
          icon: "warning",
          title: "Duplicate Item Found",
          html: `
            <p><b>Title:</b> ${item.title}</p>
            <p><b>Owner:</b> ${item.owner_name}</p>
            <p><b>Email:</b> ${item.owner_email}</p>
          `
        });
      } else {
        Swal.fire("Error", "Failed to create repository item", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">

          <div className="card card-outline card-primary">
            <div className="card-header">
              <h3 className="card-title">Create Repository Item</h3>
            </div>

            <form onSubmit={submit} encType="multipart/form-data">
              <div className="card-body">

                {/* TITLE */}
                <div className="form-group">
                  <label>Title <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    required
                    value={form.title}
                    onChange={handleChange}
                  />
                </div>

                {/* ABSTRACT WITH CKEDITOR */}
                <div className="form-group">
                  <label>Abstract</label>
                  <CKEditor
                    editor={ClassicEditor}
                    data={form.abstract}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setForm((prev) => ({ ...prev, abstract: data }));
                    }}
                  />
                </div>

                {/* STATUS */}
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    className="form-control"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="draft">Save Draft</option>
                    <option value="submitted">Submit for Review</option>
                  </select>
                  <small className="text-muted">
                    Drafts are private. Submitted items go to curator review.
                  </small>
                </div>

                <div className="row">

                  <div className="col-md-4">
                    <label>Item Type</label>
                    <select
                      name="item_type"
                      className="form-control"
                      value={form.item_type}
                      onChange={handleChange}
                    >
                      <option value="article">Article</option>
                      <option value="thesis">Thesis</option>
                      <option value="report">Report</option>
                      <option value="book">Book</option>
                      <option value="dataset">Dataset</option>
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label>Language</label>
                    <select
                      name="language"
                      className="form-control"
                      value={form.language}
                      onChange={handleChange}
                    >
                      <option value="en">English</option>
                      <option value="am">Amharic</option>
                      <option value="om">Afaan Oromo</option>
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label>Access Level</label>
                    <select
                      name="access_level"
                      className="form-control"
                      value={form.access_level}
                      onChange={handleChange}
                    >
                      <option value="open">Open</option>
                      <option value="restricted">Restricted</option>
                      <option value="embargoed">Embargoed</option>
                    </select>
                  </div>
                </div>

                {/* DOI & HANDLE */}
                <div className="row mt-3">
                  <div className="col-md-6">
                    <label>DOI</label>
                    <input
                      type="text"
                      name="doi"
                      className="form-control"
                      value={form.doi}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label>Handle</label>
                    <input
                      type="text"
                      name="handle"
                      className="form-control"
                      value={form.handle}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* EMBARGO DATE */}
                {form.access_level === "embargoed" && (
                  <div className="form-group mt-3">
                    <label>Embargo Until</label>
                    <input
                      type="date"
                      name="embargo_until"
                      className="form-control"
                      value={form.embargo_until}
                      onChange={handleChange}
                    />
                  </div>
                )}

                {/* FILE */}
                <div className="form-group mt-3">
                  <label>Upload Document</label>
                  <input
                    type="file"
                    name="file"
                    className="form-control"
                    onChange={handleChange}
                  />
                </div>

              </div>

              <div className="card-footer text-right">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Saving..." : form.status === "draft" ? "Save Draft" : "Submit"}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary ml-2"
                  onClick={() => navigate("/repository")}
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>

        </div>
      </section>
    </MainLayout>
  );
}
