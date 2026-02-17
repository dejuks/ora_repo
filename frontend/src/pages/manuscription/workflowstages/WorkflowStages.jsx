import React, { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import {
  getStages,
  createStage,
  updateStage,
  deleteStage,
} from "../../../api/workflowStage.api.js";

function WorkflowStages() {
  const [stages, setStages] = useState([]);
  const [form, setForm] = useState({ name: "", stage_order: "" });
  const [editId, setEditId] = useState(null);

  const loadStages = async () => {
    const res = await getStages();
    setStages(res.data);
  };

  useEffect(() => {
    loadStages();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await updateStage(editId, form);
      setEditId(null);
    } else {
      await createStage(form);
    }
    setForm({ name: "", stage_order: "" });
    loadStages();
  };

  const handleEdit = (stage) => {
    setForm(stage);
    setEditId(stage.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      await deleteStage(id);
      loadStages();
    }
  };

  return (
    <MainLayout>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Workflow Stage Management</h3>
          </div>

          <div className="card-body">

            {/* FORM */}
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="row">
                <div className="col-md-5">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Stage Name"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="col-md-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Stage Order"
                    value={form.stage_order}
                    onChange={(e) =>
                      setForm({ ...form, stage_order: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="col-md-4">
                  <button className="btn btn-primary">
                    {editId ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            </form>

            {/* TABLE */}
            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stages.map((stage, index) => (
                  <tr key={stage.id}>
                    <td>{index + 1}</td>
                    <td>{stage.name}</td>
                    <td>{stage.stage_order}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-info mr-2"
                        onClick={() => handleEdit(stage)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(stage.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        </div>
    </MainLayout>
  );
}

export default WorkflowStages;
