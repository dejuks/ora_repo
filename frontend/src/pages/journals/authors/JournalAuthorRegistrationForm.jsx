import React, { useState } from "react";
import Navbar from "../../../landing/components/Navbar";

const SimpleAuthorRegistrationForm = () => {

  const [formData, setFormData] = useState({
    full_name: "",
    institution: "",
    country: "",
    email: "",
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= VALIDATION =================
  const validate = () => {
    const newErrors = {};

    Object.keys(formData).forEach((key) => {
      if (!formData[key].trim()) {
        newErrors[key] = "This field is required";
      }
    });

    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ================= SUBMIT =================
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validate()) return;

  setLoading(true);
  setServerError("");

  try {
    // 1️⃣ Create User
    const response = await fetch(
      "http://localhost:5000/api/journal/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Registration failed");
    }

    const createdUserId = data.user.id;

    // 2️⃣ Insert into user_roles
    await fetch(
      "http://localhost:5000/api/user-roles/assign-author-role",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: createdUserId,
        }),
      }
    );

    setSuccess(true);

  } catch (err) {
    setServerError(err.message);
  } finally {
    setLoading(false);
  }
};



  // ================= SUCCESS SCREEN =================
  if (success) {
    return (
      <div style={styles.successWrapper}>
        <div style={styles.successCard}>
          <h2>🎉 Registration Successful!</h2>
          <p>Your author account has been created successfully.</p>
        </div>
      </div>
    );
  }

  // ================= FORM =================
  return (
    <>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>Author Registration</h1>

          {serverError && (
            <p style={{ color: "red", textAlign: "center" }}>
              {serverError}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            {[
             { label: "Full Name", name: "full_name", type: "text" },
              { label: "Institution", name: "institution", type: "text" },
              { label: "Email", name: "email", type: "email" },
              { label: "Country", name: "country", type: "text" },
              { label: "Phone", name: "phone", type: "text" },
              { label: "Password", name: "password", type: "password" },
            ].map((field) => (
              <div key={field.name} style={styles.inputGroup}>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  style={styles.input}
                />

                <label
                  style={{
                    ...styles.label,
                    top:
                      formData[field.name]
                        ? "-10px"
                        : "12px",
                    fontSize:
                      formData[field.name]
                        ? "12px"
                        : "14px",
                    background:
                      formData[field.name]
                        ? "white"
                        : "transparent",
                    padding:
                      formData[field.name]
                        ? "0 5px"
                        : "0",
                    color:
                      formData[field.name]
                        ? "#C9A227"
                        : "#0b0b0b",
                  }}
                >
                  {field.label}
                </label>

                {errors[field.name] && (
                  <p style={styles.error}>{errors[field.name]}</p>
                )}
              </div>
            ))}

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

// ================= STYLES =================
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #f0f3f2, #e9e7e9)",
    fontFamily: "Poppins, sans-serif",
  },
  card: {
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(15px)",
    padding: "40px",
    borderRadius: "20px",
    width: "800px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    color: "white",
  },
  title: {
    textAlign: "center",
    marginBottom: "30px",
    fontSize: "26px",
    fontWeight: "bold",
    color: "black",
  },
  inputGroup: {
    position: "relative",
    marginBottom: "25px",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid rgba(28, 19, 19, 0.3)",
    background: "transparent",
    color: "black",
    outline: "none",
    fontSize: "14px",
  },
  label: {
    position: "absolute",
    top: "12px",
    left: "12px",
    fontSize: "14px",
    color: "#0b0b0b",
    pointerEvents: "none",
    transition: "0.3s",
  },
  error: {
    color: "#ff6b6b",
    fontSize: "12px",
    marginTop: "5px",
  },
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "30px",
    border: "none",
    background: "#C9A227",
    color: "#0F3D2E",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    transition: "0.3s",
  },
  successWrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #0F3D2E, #14532D)",
    fontFamily: "Poppins, sans-serif",
  },
  successCard: {
    background: "white",
    padding: "40px",
    borderRadius: "20px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    color: "#0F3D2E",
  },
};

export default SimpleAuthorRegistrationForm;
