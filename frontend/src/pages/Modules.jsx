import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import MainLayout from "../components/layout/MainLayout";

import {
  getModules,
  createModule,
  updateModule,
  deleteModule,
} from "../api/module.api.js";

export default function Modules() {
  const [modules, setModules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const loadModules = async () => {
    try {
      const res = await getModules();
      setModules(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load modules", "error");
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  const openCreate = () => {
    setEditingModule(null);
    setName("");
    setDescription("");
    setShowModal(true);
  };

  const openEdit = (mod) => {
    setEditingModule(mod);
    setName(mod.name);
    setDescription(mod.description || "");
    setShowModal(true);
  };

  const saveModule = async () => {
    if (!name.trim()) {
      Swal.fire("Warning", "Module name cannot be empty", "warning");
      return;
    }

    setSaving(true);
    try {
      if (editingModule) {
        await updateModule(editingModule.uuid, { name, description });
        Swal.fire("Success", "Module updated successfully", "success");
      } else {
        await createModule({ name, description });
        Swal.fire("Success", "Module created successfully", "success");
      }
      setShowModal(false);
      loadModules();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save module", "error");
    } finally {
      setSaving(false);
    }
  };

  const removeModule = async (uuid) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the module permanently",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteModule(uuid);
        Swal.fire("Deleted!", "Module has been deleted.", "success");
        loadModules();
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to delete module", "error");
      }
    }
  };

  return (
        <MainLayout>
    
    <section className="content">
      <div className="container-fluid">

        {/* HEADER */}
        <div className="row mb-2">
          <div className="col-sm-6"><h1>Modules</h1></div>
          <div className="col-sm-6 text-right">
            <button className="btn btn-primary" onClick={openCreate}>
              <i className="fas fa-plus mr-1"></i> Add Module
            </button>
          </div>
        </div>

        {/* MODULES TABLE */}
        <div className="card card-outline card-primary">
          <div className="card-body table-responsive p-0">
            <table className="table table-hover text-nowrap">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {modules.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">No modules found</td>
                  </tr>
                ) : (
                  modules.map((mod, i) => (
                    <tr key={mod.uuid}>
                      <td>{i + 1}</td>
                      <td>{mod.name}</td>
                      <td>{mod.description}</td>
                      <td>
                        <button className="btn btn-sm btn-warning mr-1" onClick={() => openEdit(mod)}>
                          <i className="fas fa-edit"></i> Edit
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => removeModule(mod.uuid)}>
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

        {/* CREATE/EDIT MODAL */}
        {showModal && (
          <>
            <div className="modal fade show" style={{ display: "block" }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{editingModule ? "Edit Module" : "Create Module"}</h5>
                    <button className="close" onClick={() => setShowModal(false)}>
                      <span>&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                        disabled={saving}
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        className="form-control"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={saving}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>
                      Cancel
                    </button>
                    <button className="btn btn-primary" onClick={saveModule} disabled={saving}>
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
