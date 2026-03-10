import React, { useEffect, useState } from "react";
import MainLayout from "../../../../components/layout/MainLayout";
import Swal from "sweetalert2";
import {
  getJournals,
  createJournal,
  updateJournal,
  deleteJournal,
} from "../../../../api/journalApi.js";

import {
  getSections,
  createSection,
  updateSection,
  deleteSection,
} from "../../../../api/journalSectionApi.js";

export default function JournalList() {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showJournalModal, setShowJournalModal] = useState(false);
  const [editingJournal, setEditingJournal] = useState(null);

  const [showSectionModal, setShowSectionModal] = useState(false);
  const [currentJournal, setCurrentJournal] = useState(null);
  const [sections, setSections] = useState([]);
  const [editingSection, setEditingSection] = useState(null);

  // Search and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const journalsPerPage = 5;

  // --- Load Journals ---
  const loadJournals = async () => {
    setLoading(true);
    try {
      const data = await getJournals();
      setJournals(data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "Failed to load journals", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJournals();
  }, []);

  // --- Journal pagination/filter ---
  const filteredJournals = journals.filter(
    (j) =>
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.issn || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indexOfLast = currentPage * journalsPerPage;
  const indexOfFirst = indexOfLast - journalsPerPage;
  const currentJournals = filteredJournals.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredJournals.length / journalsPerPage);

  // --- Journal Modal ---
  const openCreateJournal = () => {
    setEditingJournal(null);
    setShowJournalModal(true);
  };

  const openEditJournal = (journal) => {
    setEditingJournal(journal);
    setShowJournalModal(true);
  };

  const closeJournalModal = () => setShowJournalModal(false);

  const saveJournal = async (data) => {
    try {
      if (editingJournal) {
        await updateJournal(editingJournal.id, data);
        Swal.fire("Success", "Journal updated successfully", "success");
      } else {
        await createJournal(data);
        Swal.fire("Success", "Journal created successfully", "success");
      }
      closeJournalModal();
      loadJournals();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "Operation failed", "error");
    }
  };

  const handleDeleteJournal = async (id) => {
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
        Swal.fire("Error", err.message || "Failed to delete journal", "error");
      }
    }
  };

  // --- Section Modal ---
  const openSections = async (journal) => {
    setCurrentJournal(journal);
    setEditingSection(null);
    try {
      const data = await getSections(journal.id);
      setSections(data || []);
      setShowSectionModal(true);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "Failed to load sections", "error");
    }
  };

  const closeSectionModal = () => {
    setShowSectionModal(false);
    setCurrentJournal(null);
    setSections([]);
    setEditingSection(null);
  };

  const saveSection = async (data) => {
    try {
      if (editingSection) {
        await updateSection(editingSection.id, data);
        Swal.fire("Success", "Section updated successfully", "success");
      } else {
        await createSection(currentJournal.id, data);
        Swal.fire("Success", "Section created successfully", "success");
      }
      const updated = await getSections(currentJournal.id);
      setSections(updated || []);
      setEditingSection(null);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "Operation failed", "error");
    }
  };

  const handleDeleteSection = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This section will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await deleteSection(id);
        Swal.fire("Deleted!", "Section has been deleted.", "success");
        const updated = await getSections(currentJournal.id);
        setSections(updated || []);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", err.message || "Failed to delete section", "error");
      }
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2 align-items-center">
            <div className="col-sm-6">
              <h1>Journal Management</h1>
            </div>
            <div className="col-sm-6 text-right">
              <button className="btn btn-primary" onClick={openCreateJournal}>
                <i className="fas fa-plus mr-1"></i> Add Journal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Journals Table */}
      <section className="content">
        <div className="container-fluid">
          <div className="card card-primary">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title">
                <i className="fas fa-book mr-2"></i> Journals
              </h3>
              <div className="input-group input-group-sm" style={{ width: "250px" }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search Title/ISSN..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <div className="input-group-append">
                  <span className="input-group-text">
                    <i className="fas fa-search"></i>
                  </span>
                </div>
              </div>
            </div>

            <div className="card-body table-responsive p-0">
              {loading ? (
                <div className="text-center py-5">
                  <i className="fas fa-spinner fa-spin fa-2x text-primary mb-2"></i>
                  <p>Loading journals...</p>
                </div>
              ) : currentJournals.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-book-reader fa-3x text-muted mb-3"></i>
                  <h4>No Journals Found</h4>
                  <button className="btn btn-primary mt-2" onClick={openCreateJournal}>
                    <i className="fas fa-plus mr-1"></i> Add Journal
                  </button>
                </div>
              ) : (
                <table className="table table-hover table-bordered table-striped text-nowrap">
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
                    {currentJournals.map((j, i) => (
                      <tr key={j.id}>
                        <td>{indexOfFirst + i + 1}</td>
                        <td>{j.title}</td>
                        <td>{j.issn || "-"}</td>
                        <td>{j.description || "-"}</td>
                        <td>{new Date(j.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="btn-group">
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => openEditJournal(j)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-info btn-sm"
                              onClick={() => openSections(j)}
                              title="Manage Sections"
                            >
                              <i className="fas fa-th-list"></i>
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteJournal(j.id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="card-footer clearfix">
                <ul className="pagination pagination-sm m-0 float-right">
                  {Array.from({ length: totalPages }, (_, idx) => (
                    <li key={idx} className={`page-item ${currentPage === idx + 1 ? "active" : ""}`}>
                      <button className="page-link" onClick={() => setCurrentPage(idx + 1)}>
                        {idx + 1}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Journal Modal */}
      {showJournalModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary">
                <h5 className="modal-title">{editingJournal ? "Edit Journal" : "Create Journal"}</h5>
                <button className="close" onClick={closeJournalModal}>
                  <span>&times;</span>
                </button>
              </div>

              <div className="modal-body">
                <form
                  className="form-horizontal"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const data = {
                      title: e.target.title.value,
                      issn: e.target.issn.value,
                      description: e.target.description.value,
                    };
                    saveJournal(data);
                  }}
                >
                  <div className="form-group row">
                    <label className="col-sm-2 col-form-label">Title</label>
                    <div className="col-sm-10">
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        defaultValue={editingJournal?.title || ""}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group row">
                    <label className="col-sm-2 col-form-label">ISSN</label>
                    <div className="col-sm-10">
                      <input
                        type="text"
                        className="form-control"
                        name="issn"
                        defaultValue={editingJournal?.issn || ""}
                      />
                    </div>
                  </div>

                  <div className="form-group row">
                    <label className="col-sm-2 col-form-label">Description</label>
                    <div className="col-sm-10">
                      <textarea
                        className="form-control"
                        name="description"
                        rows="3"
                        defaultValue={editingJournal?.description || ""}
                      ></textarea>
                    </div>
                  </div>

                  <div className="form-group row">
                    <div className="col-sm-12 text-right">
                      <button type="button" className="btn btn-secondary mr-2" onClick={closeJournalModal}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        {editingJournal ? "Update" : "Create"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section Modal */}
      {showSectionModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-info">
                <h5 className="modal-title">
                  Sections for: {currentJournal?.title}
                </h5>
                <button className="close" onClick={closeSectionModal}>
                  <span>&times;</span>
                </button>
              </div>

              <div className="modal-body">
                <form
                  className="form-horizontal mb-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const data = {
                      name: e.target.name.value,
                      description: e.target.description.value,
                    };
                    saveSection(data);
                  }}
                >
                  <div className="form-group row">
                    <label className="col-sm-2 col-form-label">Name</label>
                    <div className="col-sm-10">
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        defaultValue={editingSection?.name || ""}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group row">
                    <label className="col-sm-2 col-form-label">Description</label>
                    <div className="col-sm-10">
                      <textarea
                        className="form-control"
                        name="description"
                        rows="2"
                        defaultValue={editingSection?.description || ""}
                      ></textarea>
                    </div>
                  </div>

                  <div className="form-group row">
                    <div className="col-sm-12 text-right">
                      <button
                        type="button"
                        className="btn btn-secondary mr-2"
                        onClick={closeSectionModal}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-info">
                        {editingSection ? "Update Section" : "Add Section"}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Section List */}
                <table className="table table-bordered table-hover">
                  <thead className="thead-light">
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.map((s, idx) => (
                      <tr key={s.id}>
                        <td>{idx + 1}</td>
                        <td>{s.name}</td>
                        <td>{s.description || "-"}</td>
                        <td>
                          <div className="btn-group">
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => setEditingSection(s)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteSection(s.id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {sections.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">
                          No sections found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
