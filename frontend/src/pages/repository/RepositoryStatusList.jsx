import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import MainLayout from "../../components/layout/MainLayout";
import { getItems, updateRevisionComment } from "../../api/repository.api";

export default function RepositoryStatusList({ status }) {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // SEARCH
  const [search, setSearch] = useState("");

  // MODALS
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [revisionComment, setRevisionComment] = useState("");

  const fetchItems = async () => {
    try {
      const res = await getItems();
      const data = res.data.filter((item) => item.status === status);
      setItems(data);
      setFilteredItems(data);
    } catch (err) {
      Swal.fire("Error", "Failed to fetch items", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [status]);

  // SEARCH FILTER
  useEffect(() => {
    const q = search.toLowerCase();
    setFilteredItems(
      items.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.item_type?.toLowerCase().includes(q) ||
          i.language?.toLowerCase().includes(q)
      )
    );
  }, [search, items]);

  // VIEW MODAL
  const openViewModal = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  // EDIT MODAL (ONLY COMMENT)
  const openEditModal = (item) => {
    setSelectedItem(item);
    setRevisionComment(item.curator_comment || "");
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setSelectedItem(null);
    setRevisionComment("");
  };

  const hasPdf = selectedItem?.file_path || selectedItem?.pdf_file;

  // SAVE COMMENT
  const saveRevisionComment = async () => {
    if (!revisionComment.trim()) {
      Swal.fire("Warning", "Comment is required", "warning");
      return;
    }

    try {
      await updateRevisionComment(selectedItem.uuid, {
        curator_comment: revisionComment,
      });

      Swal.fire("Success", "Revision comment updated", "success");
      closeModals();
      fetchItems();
    } catch (err) {
      Swal.fire("Error", "Failed to update comment", "error");
    }
  };

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">

          {/* HEADER */}
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">
                Repository Items
                <small className="text-muted ml-2">({status})</small>
              </h1>
            </div>
          </div>

          <div className="card card-outline card-primary">
            <div className="card-header">
              <div className="row">
                {/* SEARCH TOP LEFT */}
                <div className="col-md-6">
                  <div className="input-group input-group-sm" style={{ maxWidth: 250 }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className="input-group-append">
                      <span className="input-group-text">
                        <i className="fas fa-search"></i>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 text-right">
                  <h3 className="card-title text-capitalize">
                    {status.replace("_", " ")}
                  </h3>
                </div>
              </div>
            </div>

            <div className="card-body table-responsive p-0">
              {loading ? (
                <div className="text-center p-5">
                  <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
                </div>
              ) : (
                <table className="table table-hover table-striped">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Language</th>
                      <th>Status</th>
                      <th>Comment</th>
                      <th width="120">Actions</th>
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
                      <tr key={item.uuid}>
                        <td>{item.title}</td>
                        <td>{item.item_type}</td>
                        <td>{item.language}</td>
                        <td>
                          <span className="badge badge-warning">
                            {item.status}
                          </span>
                        </td>
                        <td>
                          {item.curator_comment ? "Available" : "—"}
                        </td>
                        <td>
                          <button
                            className="btn btn-xs btn-secondary mr-1"
                            onClick={() => openViewModal(item)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>

                          {item.status === "revision_required" && (
                            <button
                              className="btn btn-xs btn-warning"
                              onClick={() => openEditModal(item)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* VIEW MODAL */}
      {showViewModal && selectedItem && (
        <>
          <div className="modal fade show d-block">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-primary">
                  <h5 className="modal-title">Item Details</h5>
                  <button className="close" onClick={closeModals}>
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <table className="table table-bordered">
                    <tbody>
                      <tr><th>Title</th><td>{selectedItem.title}</td></tr>
                      <tr><th>Abstract</th><td>{selectedItem.abstract}</td></tr>
                      <tr><th>Type</th><td>{selectedItem.item_type}</td></tr>
                      <tr><th>Language</th><td>{selectedItem.language}</td></tr>
                      <tr>
                        <th>PDF</th>
                        <td>
                          {hasPdf ? (
                            <span className="badge badge-success">Attached</span>
                          ) : (
                            <span className="badge badge-danger">No PDF</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>Revision Comment</th>
                        <td>{selectedItem.curator_comment || "—"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeModals}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* EDIT COMMENT MODAL */}
      {showEditModal && selectedItem && (
        <>
          <div className="modal fade show d-block">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-warning">
                  <h5 className="modal-title">Edit Revision Comment</h5>
                  <button className="close" onClick={closeModals}>
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Revision Required Comment</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={revisionComment}
                      onChange={(e) => setRevisionComment(e.target.value)}
                    />
                  </div>

                  <div>
                    PDF:
                    {hasPdf ? (
                      <span className="badge badge-success ml-2">Attached</span>
                    ) : (
                      <span className="badge badge-danger ml-2">No PDF</span>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeModals}>
                    Cancel
                  </button>
                  <button className="btn btn-warning" onClick={saveRevisionComment}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </MainLayout>
  );
}
