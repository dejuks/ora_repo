import React from "react";
import ResourcePage from "../../../components/library/ResourcePage.jsx";

export default function DigitalAccessPage() {
  return (
    <ResourcePage
      title="Digital Access Rights"
      subtitle="Configure view, download, and print permissions by member type."
      resource="digital-access-rules"
      idField="rule_id"
      columns={[
        { key: "digital_resource_id", label: "Digital Resource" },
        { key: "member_type_id", label: "Member Type" },
        { key: "allow_view", label: "View", render: (row) => (row.allow_view ? 'Yes' : 'No') },
        { key: "allow_download", label: "Download", render: (row) => (row.allow_download ? 'Yes' : 'No') },
        { key: "allow_print", label: "Print", render: (row) => (row.allow_print ? 'Yes' : 'No') },
      ]}
      fields={[
        { name: "digital_resource_id", label: "Digital Resource", type: "select", resource: "digital-resources", valueKey: "digital_resource_id", labelKey: "digital_resource_id" },
        { name: "member_type_id", label: "Member Type", type: "select", resource: "member-types", valueKey: "member_type_id", labelKey: "name" },
        { name: "allow_view", label: "Allow View", type: "checkbox", defaultValue: true },
        { name: "allow_download", label: "Allow Download", type: "checkbox", defaultValue: true },
        { name: "allow_print", label: "Allow Print", type: "checkbox" },
        { name: "max_downloads_per_user", label: "Max Downloads / User", type: "number" },
        { name: "note", label: "Note", type: "textarea" },
      ]}
    />
  );
}
