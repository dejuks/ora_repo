import React from "react";
import MainLayout from "../../../components/layout/MainLayout.jsx";
import { Link } from "react-router-dom";

export default function LibraryRolesPage() {
  return (
    <MainLayout>
      <section className="content-header"><div className="container-fluid"><h1>Library Roles & Permissions</h1><p className="text-muted mb-0">Library roles reuse the central system role and permission module.</p></div></section>
      <section className="content"><div className="container-fluid"><div className="card"><div className="card-body">
        <p>Use the main system role and permission screens to assign library access such as LIBRARY_ADMIN, LIBRARIAN, CATALOGER, ACQUISITION_OFFICER, INVENTORY_MANAGER, CONTENT_UPLOADER, and LIBRARY_MEMBER.</p>
        <div className="btn-group">
          <Link className="btn btn-primary" to="/roles">Open Roles</Link>
          <Link className="btn btn-outline-primary" to="/permissions">Open Permissions</Link>
          <Link className="btn btn-outline-primary" to="/role-permissions">Open Role Permissions</Link>
        </div>
      </div></div></div></section>
    </MainLayout>
  );
}
