import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { publicLogin } from "../../../api/publicUsers.api.js";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";
import "../../publicusers/publicAuth.css";

export default function PublicLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await publicLogin(form);

      localStorage.setItem("public_token", res.data.token);
      localStorage.setItem("public_user", JSON.stringify(res.data.user));

      navigate("/public/dashboard");
    } catch (err) {
      alert("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-login-page">
      <div className="login-card">
        <div className="brand">
          <h1>ORA</h1>
          <p>Open Research Access</p>
        </div>

        <form onSubmit={submit} className="login-form">
          <h2>Welcome Back</h2>
          <p className="subtitle">
            Access open research, journals & repositories
          </p>

          <div className="input-group">
            <FiMail className="icon" />
            <input
              type="email"
              required
              placeholder="Email address"
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          <div className="input-group">
            <FiLock className="icon" />
            <input
              type="password"
              required
              placeholder="Password"
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>

          <button className="login-btn" disabled={loading}>
            {loading ? "Signing in..." : <>Login <FiLogIn /></>}
          </button>

          <p className="footer-text">
            Don’t have an account?{" "}
            <span onClick={() => navigate("/register")}>
              Create one
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
