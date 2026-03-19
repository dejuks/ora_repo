import React from "react";
import ResourcePage from "../../../components/library/ResourcePage.jsx";
import libraryApi from "../../../api/library.api";

const actions = [
  {
    label: 'Submit',
    className: 'btn-info',
    onClick: async (row, ctx) => {
      try {
        await libraryApi.submitDigitalSubmission(row.submission_id);
        ctx.setNotice('Submission sent for review.');
        ctx.reload();
      } catch (err) {
        ctx.setError(err?.response?.data?.message || 'Failed to submit record');
      }
    },
  },
  {
    label: 'Approve',
    className: 'btn-success',
    onClick: async (row, ctx) => {
      try {
        await libraryApi.reviewDigitalSubmission(row.submission_id, { decision: 'approved', comments: 'Approved from UI' });
        ctx.setNotice('Submission approved.');
        ctx.reload();
      } catch (err) {
        ctx.setError(err?.response?.data?.message || 'Failed to approve submission');
      }
    },
  },
  {
    label: 'Request Correction',
    className: 'btn-warning',
    onClick: async (row, ctx) => {
      const comments = window.prompt('Correction comments:', 'Please update metadata.');
      try {
        await libraryApi.reviewDigitalSubmission(row.submission_id, { decision: 'correction_requested', comments });
        ctx.setNotice('Correction requested.');
        ctx.reload();
      } catch (err) {
        ctx.setError(err?.response?.data?.message || 'Failed to request correction');
      }
    },
  },
  {
    label: 'Publish',
    className: 'btn-primary',
    onClick: async (row, ctx) => {
      try {
        await libraryApi.publishDigitalSubmission(row.submission_id);
        ctx.setNotice('Submission published successfully.');
        ctx.reload();
      } catch (err) {
        ctx.setError(err?.response?.data?.message || 'Failed to publish submission');
      }
    },
  },
];

export default function DigitalApprovalsPage() {
  return (
    <ResourcePage
      title="Digital Approvals"
      subtitle="Review, approve, correct, and publish digital submissions."
      resource="digital-submissions"
      idField="submission_id"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'publication_year', label: 'Year' },
        { key: 'access_level', label: 'Access' },
        { key: 'status', label: 'Status' },
      ]}
      fields={[]}
      readonly
      allowDelete={false}
      extraRowActions={actions}
    />
  );
}
