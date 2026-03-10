import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import MainLayout from "../../components/layout/MainLayout";

import {
  getStatuses,
  createStatus,
  updateStatus,
  deleteStatus,
} from "../../api/manuscriptStatus.api";

export default function ManuscriptStatuses() {
  const [statuses, setStatuses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: "",
    label: "",
    description: "",
    sort_order: 0,
    is_active: true,
  });

  /* LOAD DATA */
  const loadStatuses = async () => {
    try {
      const res = await getStatuses();
      setStatuses(res.data);
    } catch (err) {
      Swal.fire("Error", "Failed to load statuses", "error");
    }
  };

  useEffect(() => {
    loadStatuses();
  }, []);

  /* OPEN CREATE */
  const openCreate = () => {
    setEditingStatus(null);
    setForm({
      code: "",
      label: "",
      description: "",
      sort_order: 0,
      is_active: true,
    });
    setShowModal(true);
  };

  /* OPEN EDIT */
  const openEdit = (status) => {
    setEditingStatus(status);
    setForm({
      code: status.code,
      label: status.label,
      description: status.description || "",
      sort_order: status.sort_order,
      is_active: status.is_active,
    });
    setShowModal(true);
  };

  /* SAVE */
  const saveStatus = async () => {
    if (!form.code.trim() || !form.label.trim()) {
      Swal.fire("Warning", "Code and Label are required", "warning");
      return;
    }

    setSaving(true);
    try {
      if (editingStatus) {
        await updateStatus(editingStatus.id, form);
        Swal.fire("Success", "Status updated successfully", "success");
      } else {
        await createStatus(form);
        Swal.fire("Success", "Status created successfully", "success");
      }
      setShowModal(false);
      loadStatuses();
    } catch (err) {
      Swal.fire("Error", "Failed to save status", "error");
    } finally {
      setSaving(false);
    }
  };

  /* DELETE */
  const removeStatus = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This status will be deleted permanently",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteStatus(id);
        Swal.fire("Deleted", "Status deleted successfully", "success");
        loadStatuses();
      } catch (err) {
        Swal.fire("Error", "Failed to delete status", "error");
      }
    }
  };

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">

          {/* HEADER */}
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Manuscript Statuses</h1>
            </div>
            <div className="col-sm-6 text-right">
              <button className="btn btn-primary" onClick={openCreate}>
                <i className="fas fa-plus mr-1"></i> Add Status
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="card card-outline card-primary">
            <div className="card-body table-responsive p-0">
              <table className="table table-hover text-nowrap">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Code</th>
                    <th>Label</th>
                    <th>Order</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {statuses.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">
                        No statuses found
                      </td>
                    </tr>
                  ) : (
                    statuses.map((s, i) => (
                      <tr key={s.id}>
                        <td>{i + 1}</td>
                        <td><span className="badge badge-info">{s.code}</span></td>
                        <td>{s.label}</td>
                        <td>{s.sort_order}</td>
                        <td>
                          {s.is_active ? (
                            <span className="badge badge-success">Active</span>
                          ) : (
                            <span className="badge badge-secondary">Inactive</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-warning mr-1"
                            onClick={() => openEdit(s)}
                          >
                            <i className="fas fa-edit"></i> Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => removeStatus(s.id)}
                          >
                            <i className="fas fa-trash"></i> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MODAL */}
          {showModal && (
            <>
              <div className="modal fade show" style={{ display: "block" }}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">
                        {editingStatus ? "Edit Status" : "Create Status"}
                      </h5>
                      <button className="close" onClick={() => setShowModal(false)}>
                        <span>&times;</span>
                      </button>
                    </div>

                    <div className="modal-body">
                      <div className="form-group">
                        <label>Code</label>
                        <input
                          className="form-control"
                          value={form.code}
                          onChange={(e) => setForm({ ...form, code: e.target.value })}
                          disabled={saving}
                        />
                      </div>

                      <div className="form-group">
                        <label>Label</label>
                        <input
                          className="form-control"
                          value={form.label}
                          onChange={(e) => setForm({ ...form, label: e.target.value })}
                          disabled={saving}
                        />
                      </div>

                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          className="form-control"
                          value={form.description}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                          disabled={saving}
                        />
                      </div>

                      <div className="form-group">
                        <label>Sort Order</label>
                        <input
                          type="number"
                          className="form-control"
                          value={form.sort_order}
                          onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                          disabled={saving}
                        />
                      </div>

                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={form.is_active}
                          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                        />
                        <label className="form-check-label">Active</label>
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button
                        className="btn btn-secondary"
                        onClick={() => setShowModal(false)}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={saveStatus}
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-backdrop fade show"></div>
            </>
          )}

        </div>
      </section>
    </MainLayout>
  );
}
