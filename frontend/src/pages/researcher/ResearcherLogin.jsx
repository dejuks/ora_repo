import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginResearcher } from "../../api/researcher.api";
import Navbar from "../../landing/components/Navbar";
import { FaEnvelope, FaLock } from "react-icons/fa";
import "./ResearcherLogin.css"; // 👈 import CSS

export default function ResearcherLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleResearcherRedirect = (user) => {
    if (!user.profile_completed) {
      navigate("/researcher/profile/" + user.uuid);
    } else {
      navigate("/researcher/dashboard");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await loginResearcher(form);

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      handleResearcherRedirect(res.user);
    } catch (err) {
      setMsg(err.response?.data?.message || "Login failed");
    }

    setLoading(false);
  };

  return (
    <>
      <Navbar />

      <div className="login-page">
        <div className="login-container">

          {/* LEFT SIDE */}
          <div className="login-left">
            <h1>
              Welcome back to <span>ORA Network</span>
            </h1>

            <p>
              Connect, collaborate, and share your research with scholars worldwide.
            </p>

            <img src="/login.jpg" alt="research" />
          </div>

          {/* RIGHT SIDE */}
          <div className="login-right">
            <div className="login-card">
              <h3>Sign in</h3>

              <form onSubmit={handleSubmit}>

                <div className="input-group-login">
                  {/* <FaEnvelope className="icon" /> */}
                  <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group-login">
                  {/* <FaLock className="icon" /> */}
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="options">
                  <a href="/forgot-password">Forgot password?</a>
                </div>

                <button className="button-login" type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </button>

              </form>

              {msg && <p className="error">{msg}</p>}

              <p className="footer-text">
                New to ORA? <a href="/researcher/register">Join now</a>
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}