import React from "react";
import ResourcePage from "../../../components/library/ResourcePage.jsx";

const copyStatusOptions = [
  { id: "available", name: "Available" },
  { id: "borrowed", name: "Borrowed" },
  { id: "reserved", name: "Reserved" },
  { id: "processing", name: "Processing" },
  { id: "lost", name: "Lost" },
  { id: "damaged", name: "Damaged" },
  { id: "withdrawn", name: "Withdrawn" },
];

export default function CopiesPage() {
  return (
    <ResourcePage
      title="Book Copies"
      subtitle="Manage accession numbers, barcodes, locations, and copy status."
      resource="copies"
      idField="copy_id"
      columns={[
        { key: "accession_number", label: "Accession" },
        { key: "barcode", label: "Barcode" },
        { key: "material_id", label: "Material ID" },
        { key: "branch_id", label: "Branch" },
        { key: "status", label: "Status" },
      ]}
      fields={[
        { name: "material_id", label: "Catalog Material", type: "select", resource: "materials", valueKey: "material_id", labelKey: "title" },
        { name: "branch_id", label: "Branch", type: "select", resource: "branches", valueKey: "branch_id", labelKey: "name" },
        { name: "location_id", label: "Location", type: "select", resource: "locations", valueKey: "location_id", labelKey: "name" },
        { name: "accession_number", label: "Accession Number" },
        { name: "barcode", label: "Barcode" },
        { name: "rfid_tag", label: "RFID Tag" },
        { name: "copy_number", label: "Copy Number", type: "number" },
        { name: "acquisition_date", label: "Acquisition Date", type: "date" },
        { name: "replacement_cost", label: "Replacement Cost", type: "number" },
        { name: "status", label: "Status", type: "select", options: copyStatusOptions, valueKey: "id", labelKey: "name" },
        { name: "is_circulation_allowed", label: "Circulation Allowed", type: "checkbox", defaultValue: true },
      ]}
    />
  );
}
