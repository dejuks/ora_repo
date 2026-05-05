import { useState } from "react";
import { updateMyProfile } from "../../api/researcher.api";
import { useNavigate } from "react-router-dom";

export default function ProfileOnboarding() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    affiliation: "",
    research_interests: "",
    bio: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateMyProfile(form);
    navigate("/researcher/dashboard");
  };

  return (
    <div style={{ background: "#f3f6f8", minHeight: "100vh" }}>
      <div className="container py-5">
        <div className="row">

          {/* LEFT – FORM */}
          <div className="col-md-7">
            <div className="card shadow-sm border-0 p-4">
              <h4 className="fw-bold mb-1">Complete your profile</h4>
              <p className="text-muted mb-4">
                Profiles with complete information get more connections.
              </p>

              {/* Progress */}
              <div className="progress mb-4" style={{ height: "6px" }}>
                <div
                  className="progress-bar"
                  style={{ width: "70%", background: "#0a66c2" }}
                />
              </div>

              <form onSubmit={handleSubmit}>

                <label className="fw-semibold mb-1">Affiliation</label>
                <input
                  className="form-control mb-3"
                  placeholder="University / Institution"
                  name="affiliation"
                  onChange={handleChange}
                  required
                />

                <label className="fw-semibold mb-1">Research Interests</label>
                <input
                  className="form-control mb-3"
                  placeholder="AI, Linguistics, History..."
                  name="research_interests"
                  onChange={handleChange}
                  required
                />

                <label className="fw-semibold mb-1">Short Bio</label>
                <textarea
                  className="form-control mb-4"
                  rows="4"
                  placeholder="Brief professional summary"
                  name="bio"
                  onChange={handleChange}
                  required
                />

                <button
                  className="btn fw-bold px-4"
                  style={{
                    background: "#0a66c2",
                    color: "#fff",
                    borderRadius: "30px"
                  }}
                >
                  Finish Profile
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT – PROFILE PREVIEW */}
          <div className="col-md-5">
            <div className="card shadow-sm border-0 p-4">
              <h6 className="fw-bold mb-3">Profile Preview</h6>

              <div className="text-center mb-3">
                <img
                  src="/default-avatar.png"
                  alt="avatar"
                  style={{
                    width: "90px",
                    height: "90px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid #0a66c2"
                  }}
                />
              </div>

              <h6 className="text-center fw-bold mb-0">
                Your Name
              </h6>

              <p className="text-center text-muted mb-2">
                {form.affiliation || "Your affiliation"}
              </p>

              <hr />

              <p className="small mb-1 fw-semibold">Research Interests</p>
              <p className="small text-muted">
                {form.research_interests || "Your research areas"}
              </p>

              <p className="small mb-1 fw-semibold">Bio</p>
              <p className="small text-muted">
                {form.bio || "Your professional bio will appear here"}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
