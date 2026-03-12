import React from "react";
import ResourcePage from "../../../components/library/ResourcePage";

export default function LibraryLogsPage() {
  return (
    <ResourcePage
      title="Library Audit Logs"
      subtitle="Trace who changed what across the library module."
      resource="audit-logs"
      idField="audit_log_id"
      columns={[
        { key: 'actor_user_id', label: 'Actor' },
        { key: 'action', label: 'Action' },
        { key: 'entity_type', label: 'Entity Type' },
        { key: 'entity_id', label: 'Entity ID' },
        { key: 'created_at', label: 'Created', render: (row) => row.created_at ? new Date(row.created_at).toLocaleString() : '' },
      ]}
      fields={[]}
      readonly
      allowDelete={false}
    />
  );
}
