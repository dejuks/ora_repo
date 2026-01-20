import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function MainLayout({ children }) {
  return (
    <div className="wrapper">
      <Navbar />
      <Sidebar />

      <div className="content-wrapper p-3">
        {children}
      </div>
    </div>
  );
}
