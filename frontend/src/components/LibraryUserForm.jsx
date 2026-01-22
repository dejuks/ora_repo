import React, { useEffect, useState } from "react";
import { getLibraryRoles } from "../api/role.api";

export default function LibraryUserForm({
  onSubmit,
  onCancel,
  initialData = {},   // ✅ SAFE DEFAULT
}) {
  const [roles, setRoles] = useState([]);
  const [photo, setPhoto] = useState(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    dob: "",
    role_id: "",
  });

  /* =========================
     LOAD INITIAL DATA (EDIT)
  ========================== */
  useEffect(() => {
    setForm({
      full_name: initialData?.full_name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      password: "",
      gender: initialData?.gender || "",
      dob: initialData?.dob?.slice(0, 10) || "",
      role_id: initialData?.role_id || "",
    });
  }, [initialData]);

  /* =========================
     LOAD ROLES
  ========================== */
  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    const res = await getLibraryRoles();
    setRoles(res.data || []);
  };

  /* =========================
     SUBMIT
  ========================== */
  const submit = (e) => {
    e.preventDefault();

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (photo) fd.append("photo", photo);

    onSubmit(fd);
  };

  return (
    <form onSubmit={submit}>
      <input
        className="form-control mb-2"
        placeholder="Full Name"
        value={form.full_name}
        onChange={(e) =>
          setForm({ ...form, full_name: e.target.value })
        }
      />

      <input
        className="form-control mb-2"
        placeholder="Email"
        value={form.email}
        onChange={(e) =>
          setForm({ ...form, email: e.target.value })
        }
      />

      {/* PASSWORD ONLY ON CREATE */}
      {!initialData?.uuid && (
        <input
          type="password"
          className="form-control mb-2"
          placeholder="Password"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />
      )}

      <select
        className="form-control mb-2"
        value={form.role_id}
        onChange={(e) =>
          setForm({ ...form, role_id: e.target.value })
        }
      >
        <option value="">-- Select Role --</option>
        {roles.map((r) => (
          <option key={r.uuid} value={r.uuid}>
            {r.name}
          </option>
        ))}
      </select>

      <input
        type="file"
        className="form-control mb-2"
        onChange={(e) => setPhoto(e.target.files[0])}
      />

      <button className="btn btn-primary">Save</button>
      <button
        type="button"
        className="btn btn-secondary ml-2"
        onClick={onCancel}
      >
        Cancel
      </button>
    </form>
  );
}
