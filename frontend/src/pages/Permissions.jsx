import React, { useEffect, useState } from "react";
import {
  getPermissions,
  createPermission,
  deletePermission,
} from "../api/permission.api";

export default function Permissions() {
  const [permissions, setPermissions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [permName, setPermName] = useState("");

  const fetchPermissions = async () => {
    const res = await getPermissions();
    setPermissions(res.data);
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  /* OPEN CREATE MODAL */
  const openCreate = () => {
    setPermName("");
    setShowModal(true);
  };

  /* SAVE */
  const savePermission = async () => {
    if (!permName.trim()) return;

    await createPermission(permName);
    closeModal();
    fetchPermissions();
  };

  /* DELETE */
  const removePermission = async (id) => {
    if (window.confirm("Delete this permission?")) {
      await deletePermission(id);
      fetchPermissions();
    }
  };

  const closeModal = () => setShowModal(false);

  return (
    <section className="content">
      <div className="container-fluid">

        {/* HEADER */}
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1>Permissions Management</h1>
          </div>
          <div className="col-sm-6 text-right">
            <button className="btn btn-primary" onClick={openCreate}>
              <i className="fas fa-plus mr-1"></i> Add Permission
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="card card-outline card-primary">
          <div className="card-body table-responsive p-0">
            <table className="table table-hover text-nowrap">
              <thead>
                <tr>
                  <th width="60">#</th>
                  <th>Permission Name</th>
                  <th width="120">Actions</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((p, i) => (
                  <tr key={p.uuid}>
                    <td>{i + 1}</td>
                    <td>{p.name}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => removePermission(p.uuid)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}

                {permissions.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center text-muted">
                      No permissions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL */}
        {showModal && (
          <>
            <div
              className="modal fade show"
              style={{ display: "block" }}
              tabIndex="-1"
            >
              <div className="modal-dialog">
                <div className="modal-content">

                  <div className="modal-header">
                    <h5 className="modal-title">Create Permission</h5>
                    <button className="close" onClick={closeModal}>
                      <span>&times;</span>
                    </button>
                  </div>

                  <div className="modal-body">
                    <div className="form-group">
                      <label>Permission Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={permName}
                        onChange={(e) => setPermName(e.target.value)}
                        placeholder="e.g. user.create"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={savePermission}
                    >
                      Save
                    </button>
                  </div>

                </div>
              </div>
            </div>

            {/* BACKDROP */}
            <div className="modal-backdrop fade show"></div>
          </>
        )}

      </div>
    </section>
  );
}
