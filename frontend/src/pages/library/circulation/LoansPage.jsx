import React from "react";
import ResourcePage from "../../../components/library/ResourcePage.jsx";
import libraryApi from "../../../api/library.api";

const columns = [
  { key: "member_id", label: "Member ID" },
  { key: "copy_id", label: "Copy ID" },
  { key: "loan_date", label: "Loan Date", render: (row) => row.loan_date ? new Date(row.loan_date).toLocaleDateString() : "" },
  { key: "due_date", label: "Due Date", render: (row) => row.due_date ? new Date(row.due_date).toLocaleDateString() : "" },
  { key: "status", label: "Status" },
];

const fields = [
  { name: "member_id", label: "Member", type: "select", resource: "members", valueKey: "member_id", labelKey: "member_code" },
  { name: "copy_id", label: "Copy", type: "select", resource: "copies", valueKey: "copy_id", labelKey: "accession_number" },
  { name: "due_date", label: "Due Date", type: "date" },
  { name: "remarks", label: "Remarks", type: "textarea" },
];

const actions = [
  {
    label: "Return",
    className: "btn-success",
    onClick: async (row, ctx) => {
      try {
        await libraryApi.returnLoan(row.loan_id, {});
        ctx.setNotice("Loan returned successfully.");
        ctx.reload();
      } catch (err) {
        ctx.setError(err?.response?.data?.message || "Failed to return loan");
      }
    },
  },
  {
    label: "Renew",
    className: "btn-warning",
    onClick: async (row, ctx) => {
      const newDueDate = window.prompt("Enter new due date (YYYY-MM-DD):");
      if (!newDueDate) return;
      try {
        await libraryApi.renewLoan(row.loan_id, { new_due_date: newDueDate });
        ctx.setNotice("Loan renewed successfully.");
        ctx.reload();
      } catch (err) {
        ctx.setError(err?.response?.data?.message || "Failed to renew loan");
      }
    },
  },
];

export default function LoansPage() {
  return (
    <ResourcePage
      title="All Loans"
      subtitle="Borrow, return, and renew physical copies."
      resource="loans"
      idField="loan_id"
      columns={columns}
      fields={fields}
      onCreate={libraryApi.borrowLoan}
      extraRowActions={actions}
    />
  );
}
