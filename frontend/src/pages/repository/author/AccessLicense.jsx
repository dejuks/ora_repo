import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar";
import Sidebar from "../../../components/layout/Sidebar";
import { getMyItems,updateAccess } from "../../../api/repository.api";

export default function AccessLicense() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

const [formData, setFormData] = useState({
  manuscript_id: "",
  access_level: "open", // ✅ FIXED
  license: "CC_BY_4",
  embargo_until: "", // ✅ FIXED name
  allow_download: false, // ✅ boolean
  notes: "",
});

  // ✅ Fetch manuscripts
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await getMyItems();
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Handle change
const handleChange = (e) => {
  const { name, value, type, checked } = e.target;

  setFormData({
    ...formData,
    [name]: type === "checkbox" ? checked : value,
  });
};

  // ✅ Filter items (search)
  const filteredItems = items.filter((item) =>
    item.title?.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Submit
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.manuscript_id) {
    alert("Please select a manuscript");
    return;
  }

  try {
    await updateAccess(formData); // ✅ API CALL

    alert("Access & License saved!");
    navigate("/repository/author/submit/list");

  } catch (err) {
    console.error(err);
    alert("Failed to save access settings");
  }
};

  return (
    <>
      <Navbar />
      <Sidebar />

      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <h4>Access & License</h4>
          </div>
        </section>

        <section className="content">
          <div className="container-fluid">
            <div className="card card-primary">
              <div className="card-header">
                <h3 className="card-title">
                  Select Manuscript & Define Access
                </h3>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="card-body">

                  {/* ================= SELECT MANUSCRIPT ================= */}
                  <div className="form-group">
                    <label>Select Manuscript</label>

                    {/* 🔍 Search */}
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="Search manuscript..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />

                    {/* Dropdown */}
                    <select
                      name="manuscript_id"
                      value={formData.manuscript_id}
                      onChange={handleChange}
                      className="form-control"
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "6px",
                        border: "1px solid #ced4da",
                        backgroundColor: "#fff",
                        color: "#000",
                        appearance: "auto",
                        WebkitAppearance: "auto",
                      }}
                    >
                      <option value="">-- Select Manuscript --</option>

                      {filteredItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.title}
                        </option>
                      ))}

                    </select>
                  </div>

                  {/* ================= ACCESS TYPE ================= */}
                  <div className="form-group">
                    <label>Access Type</label>
                    <select
                       name="access_level" // ✅ FIXED
  value={formData.access_level}
  onChange={handleChange}
  className="form-control"
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "6px",
                        border: "1px solid #ced4da",
                        backgroundColor: "#fff",
                        color: "#000",
                        appearance: "auto",
                        WebkitAppearance: "auto",
                      }}
                    >
                      <option value="open">Open Access</option>
                      <option value="restricted">Restricted</option>
                      <option value="embargo">Embargo</option>
                    </select>
                  </div>

                  {/* ================= EMBARGO ================= */}
                  {formData.access_level === "embargo" && (
                    <div className="form-group">
                      <label>Embargo Until</label>
                      <input
  type="date"
  className="form-control"
  name="embargo_until" // ✅ FIXED
  value={formData.embargo_until}
  onChange={handleChange}
/>
                    </div>
                  )}

                  {/* ================= LICENSE ================= */}
                  <div className="form-group">
                    <label>License</label>
                    <select
                      name="license"
                      value={formData.license}
                      onChange={handleChange}
                      className="form-control"
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "6px",
                        border: "1px solid #ced4da",
                        backgroundColor: "#fff",
                        color: "#000",
                        appearance: "auto",
                        WebkitAppearance: "auto",
                      }}
                    >
                      <option value="CC_BY_4">CC BY 4.0</option>
                      <option value="CC_BY_SA_4">CC BY-SA 4.0</option>
                      <option value="CC_BY_NC_4">CC BY-NC 4.0</option>
                      <option value="ALL_RIGHTS">All Rights Reserved</option>
                    </select>
                  </div>

                  {/* ================= NOTES ================= */}
                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Allow Download</label>
                    <input
                      type="checkbox"
                      name="allow_download"
                      checked={formData.allow_download}
                      onChange={handleChange}
                    />
                  </div>


                </div>

                <div className="card-footer d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                  >
                    Back
                  </button>

                  <button type="submit" className="btn btn-primary">
                    Save & Continue
                  </button>
                </div>

              </form>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}