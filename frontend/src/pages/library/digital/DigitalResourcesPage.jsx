import React from "react";
import ResourcePage from "../../../components/library/ResourcePage";
import libraryApi from "../../../api/library.api";

const actions = [
  {
    label: "Access",
    className: "btn-info",
    onClick: async (row, ctx) => {
      try {
        const data = await libraryApi.accessDigitalResource(row.digital_resource_id);
        ctx.setNotice(`Access granted. ${data.files?.length || 0} file(s) available for this resource.`);
      } catch (err) {
        ctx.setError(err?.response?.data?.message || "Failed to access resource");
      }
    },
  },
  {
    label: "Download",
    className: "btn-success",
    onClick: (row) => {
      window.open(`http://localhost:5000/api/library/digital-resources/${row.digital_resource_id}/download`, "_blank");
    },
  },
];

export default function DigitalResourcesPage() {
  return (
    <ResourcePage
      title="Digital Resources"
      subtitle="Browse published digital materials and manage access settings."
      resource="digital-resources"
      idField="digital_resource_id"
      columns={[
        { key: "material_id", label: "Material" },
        { key: "access_level", label: "Access Level" },
        { key: "is_downloadable", label: "Downloadable", render: (row) => (row.is_downloadable ? 'Yes' : 'No') },
        { key: "is_active", label: "Active", render: (row) => (row.is_active ? 'Yes' : 'No') },
      ]}
      fields={[
        { name: "material_id", label: "Catalog Material", type: "select", resource: "materials", valueKey: "material_id", labelKey: "title" },
        { name: "publisher_id", label: "Publisher", type: "select", resource: "publishers", valueKey: "publisher_id", labelKey: "name" },
        { name: "access_level", label: "Access Level", type: "select", options: [{id:'public',name:'Public'},{id:'registered_users',name:'Registered Users'},{id:'students_only',name:'Students Only'},{id:'staff_only',name:'Staff Only'},{id:'institution_only',name:'Institution Only'},{id:'restricted',name:'Restricted'}], valueKey:'id', labelKey:'name' },
        { name: "drm_required", label: "DRM Required", type: "checkbox" },
        { name: "license_start_date", label: "License Start", type: "date" },
        { name: "license_end_date", label: "License End", type: "date" },
        { name: "embargo_until", label: "Embargo Until", type: "date" },
        { name: "is_downloadable", label: "Downloadable", type: "checkbox", defaultValue: true },
        { name: "is_streamable", label: "Streamable", type: "checkbox" },
        { name: "is_active", label: "Active", type: "checkbox", defaultValue: true },
      ]}
      extraRowActions={actions}
    />
  );
}
