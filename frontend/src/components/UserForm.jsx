import React, { useEffect, useState } from "react";
import { getModules } from "../api/module.api";

export default function UserForm({ onSubmit, onCancel, initialData }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    dob: "",
    module_id: "",
  });

  const [modules, setModules] = useState([]);

  useEffect(() => {
    setForm({
      full_name: initialData.full_name || "",
      email: initialData.email || "",
      phone: initialData.phone || "",
      password: "",
      gender: initialData.gender || "",
      dob: initialData.dob?.slice(0, 10) || "",
      module_id: initialData.module_id || "",
    });
  }, [initialData]);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    const res = await getModules();
    setModules(res.data || []);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={submit}>
      <div className="modal-body">
        <div className="form-group">
          <label>Full Name</label>
          <input name="full_name" className="form-control" value={form.full_name} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input name="phone" className="form-control" value={form.phone} onChange={handleChange} />
        </div>

        {!initialData.uuid && (
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" className="form-control" value={form.password} onChange={handleChange} required />
          </div>
        )}

        <div className="form-group">
          <label>Module</label>
          <select
            name="module_id"
            className="form-control"
            value={form.module_id}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Module --</option>
            {modules.map((m) => (
              <option key={m.uuid} value={m.uuid}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Gender</label>
          <select name="gender" className="form-control" value={form.gender} onChange={handleChange}>
            <option value="">-- Select --</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div className="form-group">
          <label>DOB</label>
          <input type="date" name="dob" className="form-control" value={form.dob} onChange={handleChange} />
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-primary">Save</button>
      </div>
    </form>
  );
}
