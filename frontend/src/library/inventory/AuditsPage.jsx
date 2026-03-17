import React from 'react';
import { Link } from 'react-router-dom';
import ResourcePage from '../../../components/library/ResourcePage';
import libraryApi from '../../../api/library.api';

export default function AuditsPage() {
  return (
    <ResourcePage
      title="Inventory Audits"
      subtitle="Plan shelf-reading exercises and complete stock verification sessions."
      resource="inventory-audits"
      idField="audit_id"
      toolbar={
        <Link to="/library/inventory/report" className="btn btn-outline-primary">
          <i className="fas fa-chart-pie mr-1"></i> Inventory Report
        </Link>
      }
      columns={[
        { key: 'audit_name', label: 'Audit' },
        { key: 'branch_id', label: 'Branch' },
        { key: 'location_id', label: 'Location' },
        { key: 'status', label: 'Status' },
        { key: 'start_date', label: 'Start Date' },
      ]}
      fields={[
        { name: 'branch_id', label: 'Branch', type: 'select', resource: 'branches', valueKey: 'branch_id', labelKey: 'name' },
        { name: 'location_id', label: 'Location', type: 'select', resource: 'locations', valueKey: 'location_id', labelKey: 'name' },
        { name: 'audit_name', label: 'Audit Name' },
        { name: 'status', label: 'Status', type: 'select', options: [{ id: 'draft', name: 'Draft' }, { id: 'in_progress', name: 'In Progress' }, { id: 'completed', name: 'Completed' }], valueKey: 'id', labelKey: 'name', defaultValue: 'in_progress' },
        { name: 'start_date', label: 'Start Date', type: 'date' },
        { name: 'end_date', label: 'End Date', type: 'date' },
        { name: 'note', label: 'Note', type: 'textarea' },
      ]}
      onCreate={(payload) => libraryApi.createInventoryAudit(payload)}
    />
  );
}
