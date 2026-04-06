import { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";

export default function WikiSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "ORA Knowledge Wiki",
    siteDescription: "Collaborative internal knowledge base",
    allowPublicView: true,
    allowGuestEditing: false,
    requireApproval: true,
    enableVersionHistory: true,
    enableVandalismReports: true,
    maxUploadSize: 10,
    defaultLanguage: "English",
    seoTitle: "ORA Wiki Portal",
    seoDescription: "Official ORA documentation and knowledge system",
    notifyOnEdit: true,
    notifyOnNewArticle: true,
  });

  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    console.log("Mock saved settings:", settings);
    alert("Settings saved (mock only)");
  };

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid mt-4">

          <div className="d-flex justify-content-between mb-3">
            <h2>
              <i className="fas fa-cogs mr-2 text-primary"></i>
              Wiki Settings ⚙️
            </h2>

            <button className="btn btn-success" onClick={handleSave}>
              <i className="fas fa-save mr-1"></i>
              Save Changes
            </button>
          </div>

          {/* GENERAL SETTINGS */}
          <div className="card card-primary card-outline">
            <div className="card-header">
              <h3 className="card-title">General Settings</h3>
            </div>

            <div className="card-body">

              <div className="form-group">
                <label>Wiki Site Name</label>
                <input
                  className="form-control"
                  value={settings.siteName}
                  onChange={(e) =>
                    handleChange("siteName", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  value={settings.siteDescription}
                  onChange={(e) =>
                    handleChange("siteDescription", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Default Language</label>
                <select
                  className="form-control"
                  value={settings.defaultLanguage}
                  onChange={(e) =>
                    handleChange("defaultLanguage", e.target.value)
                  }
                >
                  <option>English</option>
                  <option>Amharic</option>
                  <option>Afaan Oromo</option>
                </select>
              </div>

            </div>
          </div>

          {/* ACCESS CONTROL */}
          <div className="card card-warning card-outline">
            <div className="card-header">
              <h3 className="card-title">Access Control 🔐</h3>
            </div>

            <div className="card-body">

              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={settings.allowPublicView}
                  onChange={(e) =>
                    handleChange("allowPublicView", e.target.checked)
                  }
                />
                <label className="form-check-label">
                  Allow public viewing
                </label>
              </div>

              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={settings.allowGuestEditing}
                  onChange={(e) =>
                    handleChange("allowGuestEditing", e.target.checked)
                  }
                />
                <label className="form-check-label">
                  Allow guest editing
                </label>
              </div>

              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={settings.requireApproval}
                  onChange={(e) =>
                    handleChange("requireApproval", e.target.checked)
                  }
                />
                <label className="form-check-label">
                  Require editor approval before publishing
                </label>
              </div>

            </div>
          </div>

          {/* EDITING SETTINGS */}
          <div className="card card-info card-outline">
            <div className="card-header">
              <h3 className="card-title">Editing Settings ✏️</h3>
            </div>

            <div className="card-body">

              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={settings.enableVersionHistory}
                  onChange={(e) =>
                    handleChange("enableVersionHistory", e.target.checked)
                  }
                />
                <label className="form-check-label">
                  Enable revision history tracking
                </label>
              </div>

              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={settings.enableVandalismReports}
                  onChange={(e) =>
                    handleChange("enableVandalismReports", e.target.checked)
                  }
                />
                <label className="form-check-label">
                  Enable vandalism reporting system
                </label>
              </div>

              <div className="form-group mt-3">
                <label>Max Upload Size (MB)</label>
                <input
                  type="number"
                  className="form-control"
                  value={settings.maxUploadSize}
                  onChange={(e) =>
                    handleChange("maxUploadSize", e.target.value)
                  }
                />
              </div>

            </div>
          </div>

          {/* SEO SETTINGS */}
          <div className="card card-success card-outline">
            <div className="card-header">
              <h3 className="card-title">SEO Settings 🌐</h3>
            </div>

            <div className="card-body">

              <div className="form-group">
                <label>SEO Title</label>
                <input
                  className="form-control"
                  value={settings.seoTitle}
                  onChange={(e) =>
                    handleChange("seoTitle", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>SEO Description</label>
                <textarea
                  className="form-control"
                  value={settings.seoDescription}
                  onChange={(e) =>
                    handleChange("seoDescription", e.target.value)
                  }
                />
              </div>

            </div>
          </div>

          {/* NOTIFICATIONS */}
          <div className="card card-secondary card-outline">
            <div className="card-header">
              <h3 className="card-title">Notifications 🔔</h3>
            </div>

            <div className="card-body">

              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={settings.notifyOnEdit}
                  onChange={(e) =>
                    handleChange("notifyOnEdit", e.target.checked)
                  }
                />
                <label className="form-check-label">
                  Notify admins on edits
                </label>
              </div>

              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={settings.notifyOnNewArticle}
                  onChange={(e) =>
                    handleChange("notifyOnNewArticle", e.target.checked)
                  }
                />
                <label className="form-check-label">
                  Notify admins on new article creation
                </label>
              </div>

            </div>
          </div>

        </div>
      </section>
    </MainLayout>
  );
}