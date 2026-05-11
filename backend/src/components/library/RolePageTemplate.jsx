import React from "react";
import MainLayout from "../layout/MainLayout.jsx";

export default function RolePageTemplate({ title, description }) {
  return (
    <MainLayout>
      <div className="p-4">
        <div className="card">
          <div className="card-body">
            <h2 className="card-title mb-3">{title}</h2>
            <p className="text-muted mb-0">{description}</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
