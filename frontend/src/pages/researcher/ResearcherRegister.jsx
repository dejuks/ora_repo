import { useState } from "react";
import { registerResearcher } from "../../api/researcher.api";

export default function ResearcherRegister() {

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    password: "",
    email: "",
    affiliation: "",
    bio: "",
    research_interests: "",
    orcid: "",
    website: ""
  });

  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("/default-avatar.png");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= CHANGE INPUT ================= */
const handleChange = (e) => {
  const { name, value } = e.target;
  setForm((prev) => ({
    ...prev,
    [name]: value
  }));
};

  /* ================= AVATAR UPLOAD ================= */
  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ================= SUBMIT FORM ================= */
const handleSubmit = async (e) => {
  e.preventDefault();
  setMsg("");

  // 🔐 FRONTEND GUARANTEE
  if (!form.password) {
    setMsg("Password is required");
    return;
  }

  setLoading(true);

  try {
    const formData = new FormData();

    // Append fields safely
    for (const key in form) {
      formData.append(key, String(form[key] ?? ""));
    }

    // Append photo last
    if (photo) {
      formData.append("photo", photo);
    }

    // 🔍 TEMP DEBUG (REMOVE AFTER SUCCESS)
    // console.log("Password sent:", form.password);

    const data = await registerResearcher(formData);
    setMsg(data.message);

  } catch (err) {
    setMsg(err.response?.data?.message || "Registration failed");
  }

  setLoading(false);
};


  return (
    <div style={{ background: "#f3f6f8", minHeight: "100vh" }}>
      <div className="container py-5">
        <div className="row align-items-center">

          {/* ================= RIGHT FORM ================= */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm p-4 text-center"
              style={{ borderRadius: "12px" }}
            >
              <h4 className="fw-bold mb-3">Sign up to ResearchNet</h4>

              {/* PROFILE IMAGE CIRCLE */}
              <div className="mb-3">
                <img
                  src={preview}
                  alt="Profile"
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "4px solid #0a66c2"
                  }}
                />
              </div>

              <input
                type="file"
                className="form-control mb-3"
                accept="image/*"
                onChange={handleAvatar}
              />

              <form onSubmit={handleSubmit}>

                <input
                  className="form-control mb-3"
                  placeholder="Full Name"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                />

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
  name="password"   // ✅ EXACT
  className="form-control mb-3"
  placeholder="Password"
  value={form.password}
  onChange={handleChange}
  required
/>

                <div className="input-group mb-3">
                  <span className="input-group-text">📞</span>
                  <input
                    className="form-control"
                    placeholder="Phone Number"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>

                <input
                  className="form-control mb-3"
                  placeholder="Affiliation / Institution"
                  name="affiliation"
                  value={form.affiliation}
                  onChange={handleChange}
                />

                <input
                  className="form-control mb-3"
                  placeholder="Research Interests"
                  name="research_interests"
                  value={form.research_interests}
                  onChange={handleChange}
                />

                <textarea
                  className="form-control mb-3"
                  rows="3"
                  placeholder="Short Bio"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                />

                <input
                  className="form-control mb-3"
                  placeholder="ORCID ID"
                  name="orcid"
                  value={form.orcid}
                  onChange={handleChange}
                />

                <input
                  className="form-control mb-3"
                  placeholder="Website / LinkedIn"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                />

                <button
                  className="btn w-100 fw-bold py-2"
                  disabled={loading}
                  style={{
                    background: "#0a66c2",
                    color: "#fff",
                    border: "none"
                  }}
                >
                  {loading ? "Creating Account..." : "Agree & Join"}
                </button>

              </form>

              {msg && (
                <div className="alert alert-info mt-3 text-center">
                  {msg}
                </div>
              )}
            </div>
          </div>

          {/* ================= LEFT HERO ================= */}
          <div className="col-md-6 text-center">
            <h1 className="fw-bold mb-3">
              Join the Professional Research Network
            </h1>

            <p className="text-muted mb-4">
              Connect with academics, publish research,
              and collaborate globally.
            </p>

            <img
              src="/link.svg"
              alt="Research Network"
              className="img-fluid"
              style={{ maxHeight: "650px" }}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
