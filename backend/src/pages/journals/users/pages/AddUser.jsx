import React, { useEffect, useState } from "react";
import MainLayout from "../../../../components/layout/MainLayout";
import { getModules } from "../../../../api/module.api";
import { createUser } from "../../../../api/user.api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function AddUserPage() {
  const navigate = useNavigate();

  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [loggedUser, setLoggedUser] = useState(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    dob: "",
    module_id: "",
  });

  /* ======================================================
     1️⃣ GET LOGGED-IN USER (SINGLE SOURCE OF TRUTH)
  ====================================================== */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      Swal.fire("Unauthorized", "Please login again", "error");
      navigate("/login");
      return;
    }

    const user = JSON.parse(storedUser);

    if (!user.module_id) {
      Swal.fire("Error", "User module not found", "error");
      return;
    }

    setLoggedUser(user);
    setForm((prev) => ({ ...prev, module_id: user.module_id }));
  }, [navigate]);

  /* ======================================================
     2️⃣ LOAD MODULES (FOR DISPLAY ONLY)
  ====================================================== */
  useEffect(() => {
    const loadModules = async () => {
      try {
        const res = await getModules();
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setModules(list);
      } catch (err) {
        Swal.fire("Error", "Failed to load modules", "error");
      } finally {
        setLoadingModules(false);
      }
    };

    loadModules();
  }, []);

  /* ======================================================
     3️⃣ HANDLE INPUT CHANGE
  ====================================================== */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ======================================================
     4️⃣ SUBMIT (MODULE IS FORCED)
  ====================================================== */
  const submit = async (e) => {
    e.preventDefault();

    try {
      await createUser({
        ...form,
        module_id: loggedUser.module_id, // 🔒 FORCE MODULE
      });

      Swal.fire("Success", "User created successfully", "success");
      navigate("/journal/users");
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to create user",
        "error"
      );
    }
  };

  /* ======================================================
     5️⃣ GET MODULE NAME FOR DISPLAY
  ====================================================== */
  const selectedModuleName = () => {
    if (!form.module_id) return "—";
    const m = modules.find((x) => x.uuid === form.module_id);
    return m ? m.name : "Unknown Module";
  };

  return (
    <MainLayout>
      <section className="content-header">
        <h1>Create User</h1>
      </section>

      <section className="content">
        <div className="card card-primary">
          <form onSubmit={submit}>
            <div className="card-body">
              <div className="row">

                {/* Full Name */}
                <div className="col-md-6">
                  <label>Full Name *</label>
                  <input
                    name="full_name"
                    className="form-control"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Email */}
                <div className="col-md-6">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Phone */}
                <div className="col-md-6 mt-3">
                  <label>Phone</label>
                  <input
                    name="phone"
                    className="form-control"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>

                {/* Password */}
                <div className="col-md-6 mt-3">
                  <label>Password *</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* MODULE (READ ONLY) */}
                <div className="col-md-6 mt-3">
                  <label>Module *</label>
                  {loadingModules ? (
                    <div className="text-muted">Loading...</div>
                  ) : (
                    <div className="form-control bg-light">
                      <i className="fas fa-lock text-success mr-2"></i>
                      {selectedModuleName()}
                    </div>
                  )}
                  <input type="hidden" value={form.module_id} />
                </div>

                {/* Gender */}
                <div className="col-md-3 mt-3">
                  <label>Gender</label>
                  <select
                    name="gender"
                    className="form-control"
                    value={form.gender}
                    onChange={handleChange}
                  >
                    <option value="">-- Select --</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                {/* DOB */}
                <div className="col-md-3 mt-3">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    className="form-control"
                    value={form.dob}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="card-footer text-right">
              <button
                type="button"
                className="btn btn-secondary mr-2"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save
              </button>
            </div>
          </form>
        </div>
      </section>
    </MainLayout>
  );
}
