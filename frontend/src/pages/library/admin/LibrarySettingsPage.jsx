import React from "react";
import MainLayout from "../../../components/layout/MainLayout";

export default function LibrarySettingsPage() {
  return (
    <MainLayout>
      <section className="content-header"><div className="container-fluid"><h1>Library Settings</h1><p className="text-muted mb-0">Settings are governed through policy, branch, location, member type, and material type records.</p></div></section>
      <section className="content"><div className="container-fluid"><div className="row">
        <div className="col-md-6"><div className="card"><div className="card-body"><h5>Configuration Areas</h5><ul><li>Branches and locations</li><li>Material types and categories</li><li>Member types</li><li>Circulation policies</li><li>Digital access rules</li></ul></div></div></div>
        <div className="col-md-6"><div className="card"><div className="card-body"><h5>Operational Notes</h5><p className="mb-0">This frontend uses the central ORA system settings for authentication and role assignment. Library-specific operational rules are maintained through the dedicated data pages rather than a separate settings API.</p></div></div></div>
      </div></div></section>
    </MainLayout>
  );
}
