import React from "react";
import ResourcePage from "../../../components/library/ResourcePage";

export default function DigitalAnalyticsPage() {
  return (
    <ResourcePage
      title="Digital Analytics"
      subtitle="Monitor views, downloads, previews, and denied access attempts."
      resource="digital-usage-logs"
      idField="usage_log_id"
      columns={[
        { key: 'digital_resource_id', label: 'Resource' },
        { key: 'user_id', label: 'User' },
        { key: 'action', label: 'Action' },
        { key: 'created_at', label: 'Created', render: (row) => row.created_at ? new Date(row.created_at).toLocaleString() : '' },
      ]}
      fields={[]}
      readonly
      allowDelete={false}
    />
  );
}
