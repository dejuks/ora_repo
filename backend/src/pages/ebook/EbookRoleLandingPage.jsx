import React from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout.jsx";

const META = {
  publisher: {
    title: "Publisher workspace",
    subtitle: "Use the publication list to track published titles and use the upload form to submit a new ebook package.",
    actions: [["My publications", "/ebook/publisher/publications", "primary"], ["Upload new ebook", "/ebook/publisher/upload", "success"]],
  },
  reader: {
    title: "Reader workspace",
    subtitle: "Browse the public catalog and open released ebook detail pages.",
    actions: [["Public catalog", "/ebook/publications", "primary"], ["Digital library", "/ebook/digital-library", "outline-secondary"]],
  },
};

export default function EbookRoleLandingPage({ role = "reader" }) {
  const meta = META[role] || META.reader;
  return (
    <MainLayout>
      <section className="content-header mb-3">
        <div className="card card-outline card-primary mb-0">
          <div className="card-body">
            <h1 className="mb-2">{meta.title}</h1>
            <p className="text-muted mb-3">{meta.subtitle}</p>
            <div className="d-flex flex-wrap" style={{ gap: 8 }}>
              {meta.actions.map(([label, to, tone]) => <Link key={to} to={to} className={`btn btn-${tone}`}>{label}</Link>)}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
