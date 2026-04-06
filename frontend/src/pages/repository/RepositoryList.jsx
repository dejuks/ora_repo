import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import { getItems, deleteItem, updateItem } from "../../api/repository.api";
import MainLayout from "../../components/layout/MainLayout";
import { Modal } from "bootstrap";
import { Link } from "react-router-dom";

export default function RepositoryList() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [editForm, setEditForm] = useState({});

  const viewModalRef = useRef(null);
  const editModalRef = useRef(null);
  const viewModalInstance = useRef(null);
  const editModalInstance = useRef(null);

  const fetchItems = async () => {
    const res = await getItems();
    setItems(res.data);
  };

  useEffect(() => {
    fetchItems();

    if (viewModalRef.current) {
      viewModalInstance.current = new Modal(viewModalRef.current);
    }
    if (editModalRef.current) {
      editModalInstance.current = new Modal(editModalRef.current);
    }
  }, []);

  /* ================= DELETE ================= */
  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This item will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteItem(id);
        Swal.fire("Deleted!", "Item has been deleted.", "success");
        fetchItems();
      }
    });
  };

  /* ================= VIEW ================= */
  const handleView = (item) => {
    setSelectedItem(item);
    viewModalInstance.current.show();
  };

  /* ================= EDIT ================= */
  const handleEdit = (item) => {
    setEditForm({ ...item });
    editModalInstance.current.show();
  };

  const submitEdit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(editForm).forEach((key) => {
      if (editForm[key] !== null) {
        formData.append(key, editForm[key]);
      }
    });

    await updateItem(editForm.id, formData);
    editModalInstance.current.hide();
    fetchItems();

    Swal.fire("Updated!", "Item has been updated.", "success");
  };

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch ((status || "").toLowerCase()) {
      case "published":
        return "badge badge-success";
      case "rejected":
        return "badge badge-danger";
      case "revision":
        return "badge badge-warning";
      case "draft":
        return "badge badge-secondary";
      default:
        return "badge badge-info";
    }
  };

  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0 text-dark">Repository Items</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="/dashboard">Home</Link>
                </li>
                <li className="breadcrumb-item active">Repository</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          {/* Summary boxes */}
          <div className="row">
            <div className="col-lg-4 col-6">
              <div className="small-box bg-primary">
                <div className="inner">
                  <h3>{items.length}</h3>
                  <p>Total Items</p>
                </div>
                <div className="icon">
                  <i className="fas fa-folder-open"></i>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-6">
              <div className="small-box bg-success">
                <div className="inner">
                  <h3>
                    {items.filter((item) => item.status === "published").length}
                  </h3>
                  <p>Published Items</p>
                </div>
                <div className="icon">
                  <i className="fas fa-check-circle"></i>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-12">
              <div className="small-box bg-warning">
                <div className="inner">
                  <h3>
                    {
                      items.filter(
                        (item) =>
                          item.status === "revision" || item.status === "rejected"
                      ).length
                    }
                  </h3>
                  <p>Needs Attention</p>
                </div>
                <div className="icon">
                  <i className="fas fa-exclamation-circle"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Main card */}
          <div className="card card-primary card-outline">
            <div className="card-header">
              <h3 className="card-title">
                <i className="fas fa-book mr-2"></i>
                Repository Items List
              </h3>

              <div className="card-tools d-flex align-items-center">
                <div className="input-group input-group-sm mr-2" style={{ width: 250 }}>
                  <input
                    type="text"
                    className="form-control float-right"
                    placeholder="Search by title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <div className="input-group-append">
                    <span className="input-group-text">
                      <i className="fas fa-search"></i>
                    </span>
                  </div>
                </div>

                <Link to="/repository/create" className="btn btn-primary btn-sm">
                  <i className="fas fa-plus mr-1"></i>
                  New Item
                </Link>
              </div>
            </div>

            <div className="card-body table-responsive p-0">
              <table className="table table-hover table-striped table-bordered mb-0">
                <thead className="bg-light">
                  <tr>
                    <th style={{ minWidth: "220px" }}>Title</th>
                    <th style={{ minWidth: "120px" }}>Type</th>
                    <th style={{ minWidth: "120px" }}>Language</th>
                    <th style={{ minWidth: "110px" }}>Status</th>
                    <th style={{ minWidth: "260px" }}>Curator Feedback</th>
                    <th style={{ width: "220px" }} className="text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-4">
                        <i className="fas fa-folder-open mr-2"></i>
                        No records found
                      </td>
                    </tr>
                  )}

                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="font-weight-bold text-dark">{item.title}</div>
                      </td>
                      <td>
                        <span>
                          {item.item_type}
                        </span>
                      </td>
                      <td>{item.language}</td>
                      <td>
                        <span>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {item.rejection_reason && (
                          <div className="text-danger mb-1">
                            <strong>Rejected:</strong> {item.rejection_reason}
                          </div>
                        )}
                        {item.curator_comment && (
                          <div className="text-warning">
                            <strong>Revision:</strong> {item.curator_comment}
                          </div>
                        )}
                        {!item.rejection_reason && !item.curator_comment && (
                          <span className="text-muted">No feedback</span>
                        )}
                      </td>
                      <td className="text-center">
                        <div className="btn-group">
                          <Link
                            to={`/repository/author/show/${item.uuid}`}
                            className="btn btn-sm btn-secondary"
                            title="Show"
                          >
                            <i className="fas fa-eye"></i>
                          </Link>

                          <Link
                            to={`/repository/edit/${item.uuid}`}
                            className="btn btn-sm btn-info"
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </Link>

                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(item.id)}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-footer clearfix">
              <span className="text-muted">
                Showing <strong>{filteredItems.length}</strong> item(s)
              </span>
            </div>
          </div>
        </div>

        {/* VIEW MODAL */}
        <div className="modal fade" ref={viewModalRef} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary">
                <h5 className="modal-title">
                  <i className="fas fa-file-alt mr-2"></i>
                  {selectedItem?.title}
                </h5>
                <button
                  type="button"
                  className="close text-white"
                  onClick={() => viewModalInstance.current.hide()}
                >
                  <span>&times;</span>
                </button>
              </div>

              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="info-box bg-light">
                      <span className="info-box-icon bg-info">
                        <i className="fas fa-layer-group"></i>
                      </span>
                      <div className="info-box-content">
                        <span className="info-box-text">Type</span>
                        <span className="info-box-number">
                          {selectedItem?.item_type || "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="info-box bg-light">
                      <span className="info-box-icon bg-success">
                        <i className="fas fa-language"></i>
                      </span>
                      <div className="info-box-content">
                        <span className="info-box-text">Language</span>
                        <span className="info-box-number">
                          {selectedItem?.language || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card card-outline card-primary">
                  <div className="card-header">
                    <h3 className="card-title">Item Details</h3>
                  </div>
                  <div className="card-body">
                    <p>
                      <strong>Abstract:</strong> {selectedItem?.abstract || "-"}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className={getStatusBadge(selectedItem?.status)}>
                        {selectedItem?.status || "-"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="card card-outline card-warning">
                  <div className="card-header">
                    <h3 className="card-title">Curator Feedback</h3>
                  </div>
                  <div className="card-body">
                    <p>
                      <strong>Rejection Reason:</strong>{" "}
                      {selectedItem?.rejection_reason || "None"}
                    </p>
                    <p className="mb-0">
                      <strong>Curator Comment:</strong>{" "}
                      {selectedItem?.curator_comment || "None"}
                    </p>
                  </div>
                </div>

                <div className="text-center mt-3">
                  {selectedItem?.file_path ? (
                    <a
                      href={selectedItem.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary"
                    >
                      <i className="fas fa-file-pdf mr-1"></i>
                      View / Download
                    </a>
                  ) : (
                    <span className="text-muted">No document uploaded</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}