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

  const [photo, setPhoto] = useState(null);
  const [modules, setModules] = useState([]);

  /* =========================
     LOAD INITIAL DATA (EDIT)
  ========================== */
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

  /* =========================
     LOAD MODULES
  ========================== */
  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    const res = await getModules();
    setModules(res.data || []);
  };

  /* =========================
     HANDLE INPUT CHANGE
  ========================== */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* =========================
     SUBMIT FORM (FormData)
  ========================== */
  const submit = (e) => {
    e.preventDefault();

    const fd = new FormData();

    // Append all form fields
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        fd.append(key, value);
      }
    });

    // Append photo if selected
    if (photo) {
      fd.append("photo", photo);
    }

    onSubmit(fd);
  };

  return (
    <form onSubmit={submit}>
      <div className="modal-body">

        {/* FULL NAME */}
        <div className="form-group">
          <label>Full Name</label>
          <input
            name="full_name"
            className="form-control"
            value={form.full_name}
            onChange={handleChange}
            required
          />
        </div>

        {/* EMAIL */}
        <div className="form-group">
          <label>Email</label>
          <input
            name="email"
            type="email"
            className="form-control"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* PHONE */}
        <div className="form-group">
          <label>Phone</label>
          <input
            name="phone"
            className="form-control"
            value={form.phone}
            onChange={handleChange}
          />
        </div>

        {/* PASSWORD (ONLY CREATE) */}
        {!initialData.uuid && (
          <div className="form-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              className="form-control"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {/* MODULE */}
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

        {/* GENDER */}
        <div className="form-group">
          <label>Gender</label>
          <select
            name="gender"
            className="form-control"
            value={form.gender}
            onChange={handleChange}
          >
            <option value="">-- Select --</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* DOB */}
        <div className="form-group">
          <label>Date of Birth</label>
          <input
            type="date"
            name="dob"
            className="form-control"
            value={form.dob}
            onChange={handleChange}
          />
        </div>

        {/* PHOTO */}
        <div className="form-group">
          <label>Photo</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0])}
          />

          {/* Preview existing photo (edit mode) */}
          {initialData.photo && !photo && (
            <div className="mt-2">
              <img
                src={initialData.photo}
                alt="User"
                width="80"
                height="80"
                style={{ borderRadius: "50%", objectFit: "cover" }}
              />
            </div>
          )}
        </div>

      </div>

      {/* FOOTER */}
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-primary">
          Save
        </button>
      </div>
    </form>
  );
}
