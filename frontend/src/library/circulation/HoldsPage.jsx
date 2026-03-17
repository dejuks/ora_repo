import React from "react";
import ResourcePage from "../../../components/library/ResourcePage";
import libraryApi from "../../../api/library.api";

const actions = [
  {
    label: "Cancel",
    className: "btn-danger",
    onClick: async (row, ctx) => {
      try {
        await libraryApi.cancelHold(row.hold_id, {});
        ctx.setNotice("Hold cancelled.");
        ctx.reload();
      } catch (err) {
        ctx.setError(err?.response?.data?.message || "Failed to cancel hold");
      }
    },
  },
  {
    label: "Fulfill",
    className: "btn-success",
    onClick: async (row, ctx) => {
      try {
        await libraryApi.fulfillHold(row.hold_id, {});
        ctx.setNotice("Hold fulfilled.");
        ctx.reload();
      } catch (err) {
        ctx.setError(err?.response?.data?.message || "Failed to fulfill hold");
      }
    },
  },
];

export default function HoldsPage() {
  return (
    <ResourcePage
      title="All Holds"
      subtitle="Manage reservation queues and pickup readiness."
      resource="holds"
      idField="hold_id"
      columns={[
        { key: "member_id", label: "Member" },
        { key: "material_id", label: "Material" },
        { key: "status", label: "Status" },
        { key: "queue_position", label: "Queue" },
        { key: "requested_at", label: "Requested At", render: (row) => row.requested_at ? new Date(row.requested_at).toLocaleDateString() : '' },
      ]}
      fields={[
        { name: "member_id", label: "Member", type: "select", resource: "members", valueKey: "member_id", labelKey: "member_code" },
        { name: "material_id", label: "Material", type: "select", resource: "materials", valueKey: "material_id", labelKey: "title" },
        { name: "copy_id", label: "Specific Copy", type: "select", resource: "copies", valueKey: "copy_id", labelKey: "accession_number" },
      ]}
      onCreate={libraryApi.createHold}
      extraRowActions={actions}
    />
  );
}
