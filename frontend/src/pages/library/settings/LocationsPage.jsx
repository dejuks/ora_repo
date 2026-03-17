import React from "react";
import ResourcePage from "../../../components/library/ResourcePage.jsx";

const locationTypes = [
  { id: "building", name: "Building" },
  { id: "floor", name: "Floor" },
  { id: "room", name: "Room" },
  { id: "section", name: "Section" },
  { id: "shelf", name: "Shelf" },
  { id: "cabinet", name: "Cabinet" },
  { id: "other", name: "Other" },
];

export default function LocationsPage() {
  return (
    <ResourcePage
      title="Library Locations"
      subtitle="Manage branch locations, rooms, sections, and shelving structure."
      resource="locations"
      idField="location_id"
      columns={[
        { key: "code", label: "Code" },
        { key: "name", label: "Name" },
        { key: "location_type", label: "Type" },
        { key: "branch_id", label: "Branch" },
        { key: "parent_location_id", label: "Parent Location" },
        { key: "is_active", label: "Active", render: (row) => (row.is_active ? "Yes" : "No") },
      ]}
      fields={[
        { name: "branch_id", label: "Branch", type: "select", resource: "branches", valueKey: "branch_id", labelKey: "name" },
        { name: "parent_location_id", label: "Parent Location", type: "select", resource: "locations", valueKey: "location_id", labelKey: "name" },
        { name: "code", label: "Code" },
        { name: "name", label: "Name" },
        { name: "location_type", label: "Location Type", type: "select", options: locationTypes },
        { name: "description", label: "Description", type: "textarea" },
        { name: "is_active", label: "Active", type: "checkbox", defaultValue: true },
      ]}
    />
  );
}
