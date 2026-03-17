import React from "react";
import ResourcePage from "../../../components/library/ResourcePage";

const formatOptions = [
  { id: "physical", name: "Physical" },
  { id: "digital", name: "Digital" },
  { id: "hybrid", name: "Hybrid" },
];

const columns = [
  { key: "title", label: "Title" },
  { key: "isbn", label: "ISBN" },
  { key: "publication_year", label: "Year" },
  { key: "material_format", label: "Format" },
  { key: "call_number", label: "Call Number" },
  {
    key: "is_reference_only",
    label: "Reference",
    render: (row) => (row.is_reference_only ? "Yes" : "No"),
  },
];

const fields = [
  { name: "title", label: "Title" },
  { name: "subtitle", label: "Subtitle" },
  { name: "material_type_id", label: "Material Type", type: "select", resource: "material-types", valueKey: "material_type_id", labelKey: "name" },
  { name: "category_id", label: "Category", type: "select", resource: "categories", valueKey: "category_id", labelKey: "name" },
  { name: "publisher_id", label: "Publisher", type: "select", resource: "publishers", valueKey: "publisher_id", labelKey: "name" },
  { name: "language_id", label: "Language", type: "select", resource: "languages", valueKey: "language_id", labelKey: "name" },
  { name: "publication_year", label: "Publication Year", type: "number" },
  { name: "isbn", label: "ISBN" },
  { name: "call_number", label: "Call Number" },
  { name: "material_format", label: "Format", type: "select", options: formatOptions, valueKey: "id", labelKey: "name" },
  { name: "is_reference_only", label: "Reference Only", type: "checkbox" },
  { name: "is_active", label: "Active", type: "checkbox", defaultValue: true },
  { name: "abstract", label: "Abstract", type: "textarea" },
];

export default function BooksBrowsePage({ adminMode = false }) {
  return (
    <ResourcePage
      title={adminMode ? "All Books" : "Library Catalog"}
      subtitle={adminMode ? "Manage title-level records across the catalog." : "Browse, create, and maintain title-level catalog records."}
      resource="materials"
      idField="material_id"
      columns={columns}
      fields={fields}
    />
  );
}
