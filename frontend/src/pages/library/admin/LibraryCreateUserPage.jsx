import React from "react";
import MainLayout from "../../../components/layout/MainLayout.jsx";
import { Link } from "react-router-dom";

export default function LibraryCreateUserPage() {
  return (
    <MainLayout>
      <section className="content-header"><div className="container-fluid"><h1>Create Library User</h1><p className="text-muted mb-0">Library user accounts are created through the central user management module, then assigned a library membership profile.</p></div></section>
      <section className="content"><div className="container-fluid"><div className="card"><div className="card-body">
        <ol>
          <li>Create the account in the global user module.</li>
          <li>Assign the relevant library role.</li>
          <li>Create a library member profile if the user borrows materials.</li>
        </ol>
        <div className="btn-group">
          <Link className="btn btn-primary" to="/users">Open Users</Link>
          <Link className="btn btn-outline-primary" to="/roles">Open Roles</Link>
        </div>
      </div></div></div></section>
    </MainLayout>
  );
}
