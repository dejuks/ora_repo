import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function MainLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Navbar />
        <main className="app-content">
          <div className="container-fluid">{children}</div>
        </main>
      </div>
    </div>
  );
}
