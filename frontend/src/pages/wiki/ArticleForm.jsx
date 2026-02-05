import { useState, useEffect } from "react";

export default function ArticleForm({ initialData = {}, onSubmit }) {
  const [form, setForm] = useState({
    title: initialData.title || "",
    slug: initialData.slug || "",
    language: initialData.language || "om",
    status: initialData.status || "draft",
  });

  const [isSlugEdited, setIsSlugEdited] = useState(!!initialData.slug); // track if user manually edited slug

  // Automatically generate slug when title changes, if slug not manually edited
  useEffect(() => {
    if (!isSlugEdited) {
      const generatedSlug = form.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "") // remove special chars
        .replace(/\s+/g, "-");        // replace spaces with -
      setForm((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [form.title, isSlugEdited]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If user types in slug, mark it as manually edited
    if (name === "slug") setIsSlugEdited(true);

    setForm({ ...form, [name]: value });
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={submit}>

      <div className="row">

        {/* TITLE */}
        <div className="col-md-12">
          <div className="form-group">
            <label>
              <i className="fas fa-heading mr-1 text-primary"></i>
              Article Title
            </label>
            <input
              type="text"
              name="title"
              className="form-control"
              placeholder="Enter article title..."
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* SLUG */}
        <div className="col-md-6">
          <div className="form-group">
            <label>
              <i className="fas fa-link mr-1 text-info"></i>
              Slug
            </label>
            <input
              type="text"
              name="slug"
              className="form-control"
              placeholder="example-article-slug"
              value={form.slug}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* LANGUAGE */}
        <div className="col-md-3">
          <div className="form-group">
            <label>
              <i className="fas fa-language mr-1 text-success"></i>
              Language
            </label>
            <select
              name="language"
              className="form-control"
              value={form.language}
              onChange={handleChange}
            >
              <option value="om">Afaan Oromo</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {/* STATUS */}
        <div className="col-md-3">
          <div className="form-group">
            <label>
              <i className="fas fa-flag mr-1 text-warning"></i>
              Status
            </label>
            <select
              name="status"
              className="form-control"
              value={form.status}
              onChange={handleChange}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

      </div>

      {/* ACTION BUTTONS */}
      <div className="text-right mt-3">
        <button type="submit" className="btn btn-primary">
          <i className="fas fa-save mr-1"></i>
          Save Article
        </button>
      </div>

    </form>
  );
}
