import React, { useState } from "react";
import { Link } from "react-router-dom";
import { registerEbookAuthor } from "../../api/auth.api";

export default function PublicEbookAuthorRegisterPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await registerEbookAuthor({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      const { token, user, message } = res.data;
      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      }
      setSuccess(message || "Registration completed successfully.");
      window.location.href = "/ebook/dashboard";
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="card card-primary card-outline">
            <div className="card-header text-center">
              <h3 className="mb-0">Public eBook Author Registration</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="card-body">
                <p className="text-muted text-center">Authors can register publicly, then submit eBook manuscripts into the ORA publishing workflow.</p>
                {error ? <div className="alert alert-danger">{error}</div> : null}
                {success ? <div className="alert alert-success">{success}</div> : null}
                <div className="form-group"><label>Full Name</label><input className="form-control" value={form.full_name} onChange={(e)=>setForm({...form,full_name:e.target.value})} required /></div>
                <div className="form-group"><label>Email</label><input type="email" className="form-control" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} required /></div>
                <div className="form-group"><label>Phone</label><input className="form-control" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} /></div>
                <div className="form-group"><label>Password</label><input type="password" className="form-control" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} required /></div>
                <div className="form-group"><label>Confirm Password</label><input type="password" className="form-control" value={form.confirmPassword} onChange={(e)=>setForm({...form,confirmPassword:e.target.value})} required /></div>
              </div>
              <div className="card-footer d-flex justify-content-between align-items-center">
                <Link to="/auth" className="btn btn-outline-secondary">Back to login</Link>
                <button className="btn btn-primary" disabled={loading}>{loading ? "Creating..." : "Register as Author"}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
