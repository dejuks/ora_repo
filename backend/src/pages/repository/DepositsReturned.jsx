import React, { useEffect, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import Swal from "sweetalert2";
import { getReturnedDeposits, updateRevisionCommentWithFile } from "../../api/repository.api";

const DepositsReturned = () => {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Editing state
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    item_type: "",
    language: "",
    access_level: "",
  });
  const [file, setFile] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await getReturnedDeposits();
      setItems(res.data);
      setFiltered(res.data);
    } catch (error) {
      Swal.fire("Error", "Failed to load returned deposits", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Search
  useEffect(() => {
    const result = items.filter(
      (i) =>
        i.title?.toLowerCase().includes(search.toLowerCase()) ||
        i.item_type?.toLowerCase().includes(search.toLowerCase()) ||
        i.language?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
    setCurrentPage(1);
  }, [search, items]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const openModal = (item) => {
    setSelectedItem(item);
    setFormData({
      title: item.title || "",
      abstract: item.abstract || "",
      item_type: item.item_type || "",
      language: item.language || "",
      access_level: item.access_level || "public",
      curator_comment: item.correction_note || "",
    });
    setFile(null);
    setEditMode(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setEditMode(false);
    setFile(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save all fields
  const handleSave = async () => {
    if (!formData.title.trim()) {
      return Swal.fire("Error", "Title cannot be empty", "error");
    }
    if (!formData.item_type.trim()) {
      return Swal.fire("Error", "Type cannot be empty", "error");
    }

    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("abstract", formData.abstract);
      payload.append("item_type", formData.item_type);
      payload.append("language", formData.language);
      payload.append("access_level", formData.access_level);
      payload.append("curator_comment", formData.curator_comment);

      if (file) payload.append("file", file);

      const updated = await updateRevisionCommentWithFile(selectedItem.uuid, payload);

      Swal.fire("Success", "Updated successfully", "success");

      // Update local state
      setItems((prev) =>
        prev.map((item) =>
          item.uuid === selectedItem.uuid
            ? { ...item, ...updated.data, file_path: file ? URL.createObjectURL(file) : item.file_path }
            : item
        )
      );

      setFiltered((prev) =>
        prev.map((item) =>
          item.uuid === selectedItem.uuid
            ? { ...item, ...updated.data, file_path: file ? URL.createObjectURL(file) : item.file_path }
            : item
        )
      );

      setSelectedItem((prev) => ({
        ...prev,
        ...updated.data,
        file_path: file ? URL.createObjectURL(file) : prev.file_path,
      }));

      setEditMode(false);
      setFile(null);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update item. Check your login.", "error");
    }
  };

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">
          <div className="card card-danger">
            <div className="card-header">
              <h3 className="card-title">Deposits Returned for Corrections</h3>
              <div className="card-tools">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: 200 }}
                />
              </div>
            </div>

            <div className="card-body table-responsive p-0">
              {loading ? (
                <p className="p-3">Loading...</p>
              ) : paginated.length === 0 ? (
                <p className="p-3">No deposits returned for correction.</p>
              ) : (
                <table className="table table-hover text-nowrap">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Language</th>
                      <th>Status</th>
                      <th>Returned On</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((item) => (
                      <tr key={item.uuid}>
                        <td>{item.title}</td>
                        <td>{item.item_type}</td>
                        <td>{item.language}</td>
                        <td><span className="badge badge-danger">Returned</span></td>
                        <td>{new Date(item.updated_at).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => openModal(item)}
                          >
                            View / Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="card-footer clearfix">
              <ul className="pagination pagination-sm m-0 float-right">
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MODAL ================= */}
      {showModal && selectedItem && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-danger">
                <h5 className="modal-title">Returned Deposit Details</h5>
                <button className="close" onClick={closeModal}><span>&times;</span></button>
              </div>

              <div className="modal-body">
                <dl className="row">
                  <dt className="col-sm-4">Title</dt>
                  <dd className="col-sm-8">
                    {editMode ? (
                      <input type="text" className="form-control" name="title" value={formData.title} onChange={handleInputChange} />
                    ) : (
                      selectedItem.title
                    )}
                  </dd>

                  <dt className="col-sm-4">Type</dt>
                  <dd className="col-sm-8">
                    {editMode ? (
                      <input type="text" className="form-control" name="item_type" value={formData.item_type} onChange={handleInputChange} />
                    ) : (
                      selectedItem.item_type
                    )}
                  </dd>

                  <dt className="col-sm-4">Language</dt>
                  <dd className="col-sm-8">
                    {editMode ? (
                      <input type="text" className="form-control" name="language" value={formData.language} onChange={handleInputChange} />
                    ) : (
                      selectedItem.language
                    )}
                  </dd>

                  <dt className="col-sm-4">Access Level</dt>
                  <dd className="col-sm-8">
                    {editMode ? (
                      <select className="form-control" name="access_level" value={formData.access_level} onChange={handleInputChange}>
                        <option value="public">Public</option>
                        <option value="restricted">Restricted</option>
                        <option value="private">Private</option>
                      </select>
                    ) : (
                      selectedItem.access_level
                    )}
                  </dd>

                  <dt className="col-sm-4">Abstract</dt>
                  <dd className="col-sm-8">
                    {editMode ? (
                      <textarea className="form-control" rows={3} name="abstract" value={formData.abstract} onChange={handleInputChange} />
                    ) : (
                      selectedItem.abstract || "N/A"
                    )}
                  </dd>

                  <dt className="col-sm-4">Correction Note</dt>
                  <dd className="col-sm-8">
                    {editMode ? (
                      <textarea className="form-control" rows={3} name="curator_comment" value={formData.curator_comment} onChange={handleInputChange} />
                    ) : (
                      selectedItem.correction_note || "No note provided"
                    )}
                  </dd>

                  <dt className="col-sm-4">File</dt>
                  <dd className="col-sm-8">
                    {selectedItem.file_path ? (
                      <a href={selectedItem.file_path} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-primary">View File</a>
                    ) : editMode ? (
                      <input type="file" className="form-control" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
                    ) : (
                      <span className="text-warning">File missing! Edit to upload.</span>
                    )}
                  </dd>

                  <dt className="col-sm-4">Returned On</dt>
                  <dd className="col-sm-8">{new Date(selectedItem.updated_at).toLocaleString()}</dd>
                </dl>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>Close</button>
                {editMode ? (
                  <>
                    <button className="btn btn-success" onClick={handleSave}>Save</button>
                    <button className="btn btn-warning" onClick={() => setEditMode(false)}>Cancel</button>
                  </>
                ) : (
                  <button className="btn btn-warning" onClick={() => setEditMode(true)}>Edit</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default DepositsReturned;
