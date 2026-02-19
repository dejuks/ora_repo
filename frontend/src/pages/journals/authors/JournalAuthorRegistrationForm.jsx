import React, { useState } from "react";
import { FaUser, FaEnvelope, FaPhone, FaLock } from "react-icons/fa";
import Navbar from "../../../landing/components/Navbar";

const JournalAuthorRegistrationForm = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/journal/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Navbar />
        <div style={styles.page}>
          <div style={styles.successCard}>
            <h2>🎉 Registration Successful</h2>
            <p>Please check your email for verification.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.page}>
        <form style={styles.card} onSubmit={handleSubmit}>
          <h2 style={styles.title}>Author Registration</h2>

          {error && <p style={styles.error}>{error}</p>}

          <Input icon={<FaUser />} name="full_name" placeholder="Full Name" onChange={handleChange} />
          <Input icon={<FaEnvelope />} name="email" type="email" placeholder="Email" onChange={handleChange} />
          <Input icon={<FaPhone />} name="phone" placeholder="Phone" onChange={handleChange} />
          <Input icon={<FaLock />} name="password" type="password" placeholder="Password" onChange={handleChange} />

          <button style={styles.button} disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </div>
    </>
  );
};

/* INPUT COMPONENT */
const Input = ({ icon, ...props }) => (
  <div style={styles.inputGroup}>
    <span style={styles.icon}>{icon}</span>
    <input {...props} style={styles.input} required />
  </div>
);

/* STYLES */
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f7f6",
  },
  card: {
    width: "400px",
    padding: "35px",
    borderRadius: "14px",
    background: "#fff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  },
  title: {
    textAlign: "center",
    marginBottom: "25px",
    color: "#0F3D2E",
  },
  inputGroup: {
    display: "flex",
    alignItems: "center",
    marginBottom: "18px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "10px",
  },
  icon: {
    color: "#C9A227",
    marginRight: "10px",
  },
  input: {
    border: "none",
    outline: "none",
    width: "100%",
  },
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "25px",
    border: "none",
    background: "#C9A227",
    color: "#0F3D2E",
    fontWeight: "bold",
    cursor: "pointer",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: "10px",
  },
  successCard: {
    background: "#fff",
    padding: "40px",
    borderRadius: "14px",
    textAlign: "center",
    color: "#0F3D2E",
  },
};

export default JournalAuthorRegistrationForm;
