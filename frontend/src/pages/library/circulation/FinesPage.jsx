import React from "react";
import ResourcePage from "../../../components/library/ResourcePage.jsx";
import libraryApi from "../../../api/library.api";

const actions = [
  {
    label: "Pay",
    className: "btn-success",
    onClick: async (row, ctx) => {
      const amount = window.prompt("Payment amount:", String(row.amount || row.balance || ""));
      if (!amount) return;
      try {
        await libraryApi.payFine(row.fine_id, { amount: Number(amount), payment_method: "cash" });
        ctx.setNotice("Fine payment recorded.");
        ctx.reload();
      } catch (err) {
        ctx.setError(err?.response?.data?.message || "Failed to record payment");
      }
    },
  },
  {
    label: "Waive",
    className: "btn-warning",
    onClick: async (row, ctx) => {
      const amount = window.prompt("Waiver amount:");
      if (!amount) return;
      const reason = window.prompt("Waiver reason:", "Manager approval");
      try {
        await libraryApi.waiveFine(row.fine_id, { amount: Number(amount), reason: reason || "Waived" });
        ctx.setNotice("Fine waiver recorded.");
        ctx.reload();
      } catch (err) {
        ctx.setError(err?.response?.data?.message || "Failed to waive fine");
      }
    },
  },
];

export default function FinesPage() {
  return (
    <ResourcePage
      title="All Fines"
      subtitle="Assess, collect, and waive overdue or damage-related fines."
      resource="fines"
      idField="fine_id"
      columns={[
        { key: "member_id", label: "Member" },
        { key: "reason", label: "Reason" },
        { key: "amount", label: "Amount" },
        { key: "paid_amount", label: "Paid" },
        { key: "waived_amount", label: "Waived" },
        { key: "status", label: "Status" },
      ]}
      fields={[
        { name: "member_id", label: "Member", type: "select", resource: "members", valueKey: "member_id", labelKey: "member_code" },
        { name: "loan_id", label: "Loan", type: "select", resource: "loans", valueKey: "loan_id", labelKey: "loan_id" },
        { name: "copy_id", label: "Copy", type: "select", resource: "copies", valueKey: "copy_id", labelKey: "accession_number" },
        { name: "reason", label: "Reason" },
        { name: "amount", label: "Amount", type: "number" },
        { name: "status", label: "Status", type: "select", options: [{ id: 'unpaid', name: 'Unpaid' }, { id: 'partial', name: 'Partial' }, { id: 'paid', name: 'Paid' }, { id: 'waived', name: 'Waived' }], valueKey: 'id', labelKey: 'name' },
        { name: "note", label: "Note", type: "textarea" },
      ]}
      extraRowActions={actions}
    />
  );
}
