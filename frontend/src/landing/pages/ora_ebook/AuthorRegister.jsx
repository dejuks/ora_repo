import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

const API_URL = process.env.REACT_APP_API_URL;

const AuthorRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    affiliation: "",
    bio: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // simple validation
    if (!form.full_name || !form.email || !form.password) {
      alert("Please fill required fields");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API_URL}/ebook_authors/register-author`,
        form
      );

      alert("Author Registered Successfully");
      // navigate to login pages or author dashboard
      navigate("/auth");

      // reset form
      setForm({
        full_name: "",
        email: "",
        password: "",
        phone: "",
        affiliation: "",
        bio: "",
      });

    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.error || "Error registering author"
      );
    } finally {
      setLoading(false);
    }
  };

  return ( 
    <>
    <Navbar />
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h3 className="mb-3">Author Registration</h3>

      <form onSubmit={handleSubmit}>
        <input
          name="full_name"
          placeholder="Full Name *"
          value={form.full_name}
          onChange={handleChange}
          className="form-control mb-2"
        />

        <input
          name="email"
          type="email"
          placeholder="Email *"
          value={form.email}
          onChange={handleChange}
          className="form-control mb-2"
        />

        <input
          name="password"
          type="password"
          placeholder="Password *"
          value={form.password}
          onChange={handleChange}
          className="form-control mb-2"
        />

        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          className="form-control mb-2"
        />

        <input
          name="affiliation"
          placeholder="Affiliation (University/Company)"
          value={form.affiliation}
          onChange={handleChange}
          className="form-control mb-2"
        />

        <textarea
          name="bio"
          placeholder="Short Bio"
          value={form.bio}
          onChange={handleChange}
          className="form-control mb-3"
        />

        <button
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
    </>
  );
};

export default AuthorRegister;