import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getCategories, deleteCategory } from "../../api/wikiCategory.api";
import MainLayout from "../../components/layout/MainLayout";
import { Link } from "react-router-dom";

export default function WikiCategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const remove = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Category?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Delete",
    });

    if (confirm.isConfirmed) {
      await deleteCategory(id);
      Swal.fire("Deleted!", "Category has been deleted.", "success");
      fetchCategories();
    }
  };

  // Filter categories by search
  const filtered = categories.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid mt-4">

          {/* HEADER */}
          <div className="d-flex justify-content-between mb-3">
            <h2 className="text-dark">
              <i className="fas fa-th-list mr-2 text-warning"></i>
              Wiki Categories
            </h2>
            <Link to="/wiki-categories/create" className="btn btn-primary">
              <i className="fas fa-plus mr-1"></i>
              New Category
            </Link>
          </div>

          {/* TABLE CARD */}
          <div className="card card-warning card-outline">
            
            {/* TABLE HEADER WITH SEARCH */}
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title m-0">Category List</h3>
              <div className="card-tools">
                <div className="input-group input-group-sm" style={{ width: "200px" }}>
                  <input
                    type="text"
                    name="table_search"
                    className="form-control float-right"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <div className="input-group-append">
                    <button className="btn btn-warning">
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* TABLE BODY */}
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <i className="fas fa-spinner fa-spin mr-2"></i>Loading categories...
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  No categories found
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-striped">
                    <thead className="bg-warning">
                      <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((c) => (
                        <tr key={c.id}>
                          <td>{c.name}</td>
                          <td>{c.description}</td>
                          <td className="text-center">
                            <Link
                              to={`/wiki/categories/edit/${c.id}`}
                              className="btn btn-info btn-sm mr-1"
                            >
                              <i className="fas fa-edit"></i>
                            </Link>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => remove(c.id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>
    </MainLayout>
  );
}
