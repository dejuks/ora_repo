import React, { useEffect, useState } from "react";
import MainLayout from "../../../../components/layout/MainLayout";
import Swal from "sweetalert2";
import { getJournals, createJournal, updateJournal, deleteJournal } from "../../../../api/journalApi.js";
import JournalForm from "../../../../components/journal/JournalForm.jsx";

export default function JournalList() {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingJournal, setEditingJournal] = useState(null);

  // --- Load Journals ---
  const loadJournals = async () => {
    setLoading(true);
    try {
      const res = await getJournals();
      setJournals(res.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load journals", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJournals();
  }, []);

  // --- Modal Functions ---
  const openCreate = () => {
    setEditingJournal(null);
    setShowModal(true);
  };

  const openEdit = (journal) => {
    setEditingJournal(journal);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const saveJournal = async (data) => {
    try {
      if (editingJournal) {
        await updateJournal(editingJournal.id, data);
        Swal.fire("Success", "Journal updated successfully", "success");
      } else {
        await createJournal(data);
        Swal.fire("Success", "Journal created successfully", "success");
      }
      closeModal();
      loadJournals();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.response?.data?.error || "Operation failed", "error");
    }
  };

  // --- Delete Journal ---
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This journal will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await deleteJournal(id);
        Swal.fire("Deleted!", "Journal has been deleted.", "success");
        loadJournals();
      } catch (err) {
        console.error(err);
        Swal.fire("Error", err.response?.data?.error || "Failed to delete journal", "error");
      }
    }
  };

  return (
    <MainLayout>
      {/* PAGE HEADER */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2 align-items-center">
            <div className="col-sm-6">
              <h1>Journal Management</h1>
            </div>
            <div className="col-sm-6 text-right">
              <button className="btn btn-primary" onClick={openCreate}>
                <i className="fas fa-plus mr-1"></i> Add Journal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12 mb-3">
              <div className="card card-info">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-info-circle mr-2"></i>
                    Journals Overview
                  </h3>
                </div>
                <div className="card-body">
                  <p>
                    <strong>Total Journals:</strong>{" "}
                    <span className="badge badge-success">{journals.length}</span>
                  </p>
                  <p className="text-muted">
                    You can create, edit, or delete journals. Make sure journal ISSN is unique.
                  </p>
                </div>
              </div>
            </div>

            {/* Journals Table */}
            <div className="col-md-12">
              <div className="card card-primary">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-book mr-2"></i> Journals
                  </h3>
                  <div className="card-tools">
                    <button
                      type="button"
                      className="btn btn-tool"
                      onClick={loadJournals}
                      disabled={loading}
                    >
                      <i className={`fas ${loading ? "fa-spinner fa-spin" : "fa-sync-alt"}`}></i>
                    </button>
                  </div>
                </div>

                <div className="card-body">
                  {loading ? (
                    <div className="text-center py-5">
                      <i className="fas fa-spinner fa-spin fa-2x text-primary mb-2"></i>
                      <p>Loading journals...</p>
                    </div>
                  ) : journals.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-book-reader fa-3x text-muted mb-3"></i>
                      <h4>No Journals Found</h4>
                      <p>Start by adding a new journal.</p>
                      <button className="btn btn-primary mt-2" onClick={openCreate}>
                        <i className="fas fa-plus mr-1"></i> Add Journal
                      </button>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover table-bordered">
                        <thead className="thead-light">
                          <tr>
                            <th>#</th>
                            <th>Title</th>
                            <th>ISSN</th>
                            <th>Description</th>
                            <th>Created At</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {journals.map((j, i) => (
                            <tr key={j.id}>
                              <td>{i + 1}</td>
                              <td>{j.title}</td>
                              <td>{j.issn || "-"}</td>
                              <td>{j.description || "-"}</td>
                              <td>{new Date(j.created_at).toLocaleDateString()}</td>
                              <td>
                                <div className="btn-group">
                                  <button
                                    className="btn btn-sm btn-outline-warning mr-1"
                                    onClick={() => openEdit(j)}
                                    title="Edit Journal"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDelete(j.id)}
                                    title="Delete Journal"
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
                  )}
                </div>

                {journals.length > 0 && (
                  <div className="card-footer text-right">
                    <small className="text-muted">
                      Last updated: {new Date().toLocaleTimeString()}
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL */}
      {showModal && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block", zIndex: 1050 }}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-primary">
                  <h5 className="modal-title">
                    {editingJournal ? "Edit Journal" : "Create Journal"}
                  </h5>
                  <button className="close" onClick={closeModal}>
                    <span>&times;</span>
                  </button>
                </div>

                <div
                  className="modal-body"
                  style={{ maxHeight: "60vh", overflowY: "auto" }}
                >
                  <JournalForm
                    onSubmit={saveJournal}
                    onCancel={closeModal}
                    initialData={editingJournal || {}}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Backdrop */}
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </MainLayout>
  );
}
