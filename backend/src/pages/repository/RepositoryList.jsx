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

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">

          {/* HEADER */}
          <div className="row mb-3">
            <div className="col-sm-6">
              <h1>Repository Items</h1>
            </div>
            <div className="col-sm-6 text-right">
              <Link to="/repository/create" className="btn btn-primary">
                <i className="fas fa-plus"></i> New Item
              </Link>
            </div>
          </div>

          {/* TABLE */}
          <div className="card card-outline card-primary">
            <div className="card-header">
              <h3 className="card-title">Items List</h3>
              <div className="card-tools">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  style={{ width: 250 }}
                  placeholder="Search title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="card-body table-responsive p-0">
              <table className="table table-hover table-bordered table-striped">
                <thead className="bg-primary">
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Language</th>
                    <th>Status</th>
                    <th>Curator Feedback</th>
                    <th width="220">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">
                        No records found
                      </td>
                    </tr>
                  )}

                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{item.item_type}</td>
                      <td>{item.language}</td>
                      <td>
                        <span
                          className={`badge ${
                            item.status === "published"
                              ? "badge-success"
                              : "badge-warning"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {item.rejection_reason && (
                          <div>
                            <strong>Rejected:</strong> {item.rejection_reason}
                          </div>
                        )}
                        {item.curator_comment && (
                          <div>
                            <strong>Revision:</strong> {item.curator_comment}
                          </div>
                        )}
                        {!item.rejection_reason && !item.curator_comment && (
                          <span className="text-muted">No feedback</span>
                        )}
                      </td>
                      <td>
                        <Link to={`/repository/author/show/${item.uuid}`}
                          className="btn btn-sm btn-secondary mr-1"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>

                        <Link to={`/repository/edit/${item.uuid}`}
                          className="btn btn-sm btn-info mr-1"
                        >
                          <i className="fas fa-edit"></i>
                        </Link>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(item.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* VIEW MODAL */}
        <div className="modal fade" ref={viewModalRef} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary">
                <h5 className="modal-title">{selectedItem?.title}</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => viewModalInstance.current.hide()}
                >
                  <span>&times;</span>
                </button>
              </div>

              <div className="modal-body">
                <p><b>Abstract:</b> {selectedItem?.abstract || "-"}</p>
                <p><b>Type:</b> {selectedItem?.item_type}</p>
                <p><b>Language:</b> {selectedItem?.language}</p>
                <p><b>Status:</b> {selectedItem?.status}</p>

                {/* CURATOR FEEDBACK */}
                <hr />
                <h5>Curator Feedback</h5>
                <p>
                  <b>Rejection Reason:</b>{" "}
                  {selectedItem?.rejection_reason || "None"}
                </p>
                <p>
                  <b>Curator Comment:</b>{" "}
                  {selectedItem?.curator_comment || "None"}
                </p>

                <hr />

                <div className="text-center">
                  {selectedItem?.file_path ? (
                    <a
                      href={selectedItem.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary"
                    >
                      <i className="fas fa-file-pdf"></i> View / Download
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
