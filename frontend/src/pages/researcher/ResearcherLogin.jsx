import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginResearcher } from "../../api/researcher.api";

export default function ResearcherLogin() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= INPUT CHANGE ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= REDIRECT FUNCTION ================= */
const handleResearcherRedirect = (user) => {

  // If profile not completed (optional future feature)
  if (!user.profile_completed) {
    navigate("/researcher/profile/" + user.uuid);
    return;
  }

  // Role-based redirects (optional, scalable)
  if (user.roles?.includes("PLATFORM_ADMIN")) {
    navigate("/researcher/dashboard"); // or /admin later
  } 
  else if (user.roles?.includes("GROUP_MODERATOR")) {
    navigate("/researcher/dashboard");
  }
  else if (user.roles?.includes("CONTENT_MANAGER")) {
    navigate("/researcher/dashboard");
  }
  else {
    // ✅ DEFAULT: researcher dashboard
    navigate("/researcher/dashboard");
  }
};


  /* ================= LOGIN SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await loginResearcher(form);

      /**
       * Expected API response:
       * {
       *   token,
       *   user:{
       *     uuid,
       *     roles:[],
       *     profile_completed
       *   }
       * }
       */

      // SAVE TOKEN
      localStorage.setItem("token", res.token);

      // SAVE USER
      localStorage.setItem("user", JSON.stringify(res.user));

      setMsg("Login successful!");

      // 🔥 IMPORTANT — redirect user
handleResearcherRedirect(res.user);

    } catch (err) {
      setMsg(err.response?.data?.message || "Login failed");
    }

    setLoading(false);
  };

  /* ================= UI ================= */
  return (
    <div style={{ background: "#f3f6f8", minHeight: "100vh" }}>
      <div className="container py-5">
        <div className="row align-items-center">

          {/* HERO LEFT */}
          <div className="col-md-6 text-center mb-4">
            <h1 className="fw-bold mb-3">Welcome Back to ResearchNet</h1>
            <p className="text-muted mb-4">
              Connect with academics, publish research, and collaborate globally.
            </p>

            <img
              src="/oromo-research-network.png"
              alt="Research Network"
              className="img-fluid"
              style={{ maxHeight: "650px" }}
            />
          </div>

          {/* LOGIN CARD */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius:"12px" }}>
              <h4 className="fw-bold mb-3 text-center">
                Sign in to ResearchNet
              </h4>

              <form onSubmit={handleSubmit}>

                <input
                  type="email"
                  className="form-control mb-3"
                  placeholder="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />

                <input
                  type="password"
                  className="form-control mb-3"
                  placeholder="Password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />

                <div className="d-flex justify-content-between mb-3">
                  <a href="/forgot-password" className="small">
                    Forgot password?
                  </a>
                </div>

                <button
                  className="btn btn-primary w-100 fw-bold py-2"
                  disabled={loading}
                  style={{ background:"#0a66c2", border:"none" }}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>

              </form>

              {msg && (
                <div className="alert alert-info mt-3 text-center">
                  {msg}
                </div>
              )}

              <p className="text-center text-muted mt-3 small">
                New to ResearchNet? <a href="/researcher/register">Join now</a>
              </p>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
