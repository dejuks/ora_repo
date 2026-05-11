import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import PhysicalMemberDashboardPage from "../../pages/library/physical/member/dashboard.jsx";
import PhysicalMemberOpacPage from "../../pages/library/physical/member/opac.jsx";
import PhysicalMemberLoansPage from "../../pages/library/physical/member/my-loans.jsx";
import PhysicalMemberHoldsPage from "../../pages/library/physical/member/my-holds.jsx";
import PhysicalMemberFinesPage from "../../pages/library/physical/member/my-fines.jsx";
import PhysicalMemberAccountPage from "../../pages/library/physical/member/account.jsx";

import PhysicalLibrarianDashboardPage from "../../pages/library/physical/librarian/dashboard.jsx";
import PhysicalCirculationDeskPage from "../../pages/library/physical/librarian/circulation-desk.jsx";
import PhysicalLoansPage from "../../pages/library/physical/librarian/loans.jsx";
import PhysicalHoldsPage from "../../pages/library/physical/librarian/holds.jsx";
import PhysicalFinesPage from "../../pages/library/physical/librarian/fines.jsx";
import PhysicalHistoryPage from "../../pages/library/physical/librarian/history.jsx";

import PhysicalCatalogerDashboardPage from "../../pages/library/physical/cataloger/dashboard.jsx";
import PhysicalCatalogRecordsPage from "../../pages/library/physical/cataloger/catalog-records.jsx";
import PhysicalNewRecordPage from "../../pages/library/physical/cataloger/new-record.jsx";
import PhysicalMetadataPage from "../../pages/library/physical/cataloger/metadata.jsx";
import PhysicalCopiesPage from "../../pages/library/physical/cataloger/copies.jsx";
import PhysicalCatalogingToolsPage from "../../pages/library/physical/cataloger/tools.jsx";

import PhysicalAcquisitionDashboardPage from "../../pages/library/physical/acquisition-officer/dashboard.jsx";
import PhysicalRequestsPage from "../../pages/library/physical/acquisition-officer/requests.jsx";
import PhysicalOrdersPage from "../../pages/library/physical/acquisition-officer/orders.jsx";
import PhysicalDeliveriesPage from "../../pages/library/physical/acquisition-officer/deliveries.jsx";
import PhysicalApprovalsPage from "../../pages/library/physical/acquisition-officer/approvals.jsx";
import PhysicalVendorsPage from "../../pages/library/physical/acquisition-officer/vendors.jsx";

import PhysicalInventoryDashboardPage from "../../pages/library/physical/inventory-manager/dashboard.jsx";
import PhysicalAuditsPage from "../../pages/library/physical/inventory-manager/audits.jsx";
import PhysicalInventoryReportPage from "../../pages/library/physical/inventory-manager/report.jsx";
import PhysicalMissingItemsPage from "../../pages/library/physical/inventory-manager/missing-items.jsx";
import PhysicalDamagedItemsPage from "../../pages/library/physical/inventory-manager/damaged-items.jsx";
import PhysicalTagsPage from "../../pages/library/physical/inventory-manager/tags.jsx";

import PhysicalManagerDashboardPage from "../../pages/library/physical/library-manager/dashboard.jsx";
import PhysicalPoliciesPage from "../../pages/library/physical/library-manager/policies.jsx";
import PhysicalUsageReportsPage from "../../pages/library/physical/library-manager/usage-reports.jsx";
import PhysicalLoanReportsPage from "../../pages/library/physical/library-manager/loan-reports.jsx";
import PhysicalInventoryReportsPage from "../../pages/library/physical/library-manager/inventory-reports.jsx";

import PhysicalAdminDashboardPage from "../../pages/library/physical/system-administrator/dashboard.jsx";
import PhysicalAdminUsersPage from "../../pages/library/physical/system-administrator/users.jsx";
import PhysicalCreateUserPage from "../../pages/library/physical/system-administrator/create-user.jsx";
import PhysicalRolesPage from "../../pages/library/physical/system-administrator/roles.jsx";
import PhysicalAuditLogsPage from "../../pages/library/physical/system-administrator/audit-logs.jsx";
import PhysicalSystemSettingsPage from "../../pages/library/physical/system-administrator/system-settings.jsx";
import PhysicalSecurityAlertsPage from "../../pages/library/physical/system-administrator/security-alerts.jsx";
import MaterialTypesPage from "../../pages/library/physical/system-administrator/material-types.jsx";
import CategoriesPage from "../../pages/library/physical/system-administrator/categories.jsx";
import PublishersPage from "../../pages/library/physical/system-administrator/publishers.jsx";
import LanguagesPage from "../../pages/library/physical/system-administrator/languages.jsx";
import SubjectsPage from "../../pages/library/physical/system-administrator/subjects.jsx";
import ContributorsPage from "../../pages/library/physical/system-administrator/contributors.jsx";
import BranchesPage from "../../pages/library/physical/system-administrator/branches.jsx";
import LocationsPage from "../../pages/library/physical/system-administrator/locations.jsx";
import MemberTypesPage from "../../pages/library/physical/system-administrator/member-types.jsx";

import DigitalLibrarianDashboardPage from "../../pages/library/digital/digital-librarian/dashboard.jsx";
import DigitalResourcesPage from "../../pages/library/digital/digital-librarian/resources.jsx";
import DigitalNewPage from "../../pages/library/digital/digital-librarian/new-resource.jsx";
import DigitalMetadataPage from "../../pages/library/digital/digital-librarian/metadata.jsx";
import DigitalAccessPage from "../../pages/library/digital/digital-librarian/access.jsx";
import DigitalApprovalsPage from "../../pages/library/digital/digital-librarian/approvals.jsx";
import DigitalCollectionsPage from "../../pages/library/digital/digital-librarian/collections.jsx";
import DigitalAnalyticsPage from "../../pages/library/digital/digital-librarian/analytics.jsx";
import SubmissionWorkflowPage from "../../pages/library/digital/digital-librarian/workflow.jsx";

import ContentUploaderDashboardPage from "../../pages/library/digital/content-uploader/dashboard.jsx";
import ContentUploaderUploadPage from "../../pages/library/digital/content-uploader/upload.jsx";
import ContentUploaderSubmissionsPage from "../../pages/library/digital/content-uploader/submissions.jsx";
import ContentUploaderMetadataPage from "../../pages/library/digital/content-uploader/metadata.jsx";

import DigitalMemberDashboardPage from "../../pages/library/digital/member/dashboard.jsx";
import MemberDigitalLibraryPage from "../../pages/library/digital/member/library.jsx";
import DigitalMemberAccountPage from "../../pages/library/digital/member/account.jsx";

import DigitalAdminDashboardPage from "../../pages/library/digital/admin/dashboard.jsx";
import DigitalAdminUsersPage from "../../pages/library/digital/admin/users.jsx";
import DigitalAdminSystemSettingsPage from "../../pages/library/digital/admin/system-settings.jsx";
import DigitalAdminAuditLogsPage from "../../pages/library/digital/admin/audit-logs.jsx";

import ExternalPublisherDashboardPage from "../../pages/library/digital/external-publisher/dashboard.jsx";
import ExternalPublisherPackagesPage from "../../pages/library/digital/external-publisher/packages.jsx";

export default function LibraryModuleRoutes() {
  return (
    <Routes>
      <Route path="physical/member/dashboard" element={<PhysicalMemberDashboardPage />} />
      <Route path="physical/member/opac" element={<PhysicalMemberOpacPage />} />
      <Route path="physical/member/my-loans" element={<PhysicalMemberLoansPage />} />
      <Route path="physical/member/my-holds" element={<PhysicalMemberHoldsPage />} />
      <Route path="physical/member/my-fines" element={<PhysicalMemberFinesPage />} />
      <Route path="physical/member/account" element={<PhysicalMemberAccountPage />} />

      <Route path="physical/librarian/dashboard" element={<PhysicalLibrarianDashboardPage />} />
      <Route path="physical/librarian/circulation-desk" element={<PhysicalCirculationDeskPage />} />
      <Route path="physical/librarian/loans" element={<PhysicalLoansPage />} />
      <Route path="physical/librarian/holds" element={<PhysicalHoldsPage />} />
      <Route path="physical/librarian/fines" element={<PhysicalFinesPage />} />
      <Route path="physical/librarian/history" element={<PhysicalHistoryPage />} />

      <Route path="physical/cataloger/dashboard" element={<PhysicalCatalogerDashboardPage />} />
      <Route path="physical/cataloger/catalog-records" element={<PhysicalCatalogRecordsPage />} />
      <Route path="physical/cataloger/new-record" element={<PhysicalNewRecordPage />} />
      <Route path="physical/cataloger/metadata" element={<PhysicalMetadataPage />} />
      <Route path="physical/cataloger/copies" element={<PhysicalCopiesPage />} />
      <Route path="physical/cataloger/tools" element={<PhysicalCatalogingToolsPage />} />

      <Route path="physical/acquisition-officer/dashboard" element={<PhysicalAcquisitionDashboardPage />} />
      <Route path="physical/acquisition-officer/requests" element={<PhysicalRequestsPage />} />
      <Route path="physical/acquisition-officer/orders" element={<PhysicalOrdersPage />} />
      <Route path="physical/acquisition-officer/deliveries" element={<PhysicalDeliveriesPage />} />
      <Route path="physical/acquisition-officer/approvals" element={<PhysicalApprovalsPage />} />
      <Route path="physical/acquisition-officer/vendors" element={<PhysicalVendorsPage />} />

      <Route path="physical/inventory-manager/dashboard" element={<PhysicalInventoryDashboardPage />} />
      <Route path="physical/inventory-manager/audits" element={<PhysicalAuditsPage />} />
      <Route path="physical/inventory-manager/report" element={<PhysicalInventoryReportPage />} />
      <Route path="physical/inventory-manager/missing-items" element={<PhysicalMissingItemsPage />} />
      <Route path="physical/inventory-manager/damaged-items" element={<PhysicalDamagedItemsPage />} />
      <Route path="physical/inventory-manager/tags" element={<PhysicalTagsPage />} />

      <Route path="physical/library-manager/dashboard" element={<PhysicalManagerDashboardPage />} />
      <Route path="physical/library-manager/policies" element={<PhysicalPoliciesPage />} />
      <Route path="physical/library-manager/usage-reports" element={<PhysicalUsageReportsPage />} />
      <Route path="physical/library-manager/loan-reports" element={<PhysicalLoanReportsPage />} />
      <Route path="physical/library-manager/inventory-reports" element={<PhysicalInventoryReportsPage />} />

      <Route path="physical/system-administrator/dashboard" element={<PhysicalAdminDashboardPage />} />
      <Route path="physical/system-administrator/users" element={<PhysicalAdminUsersPage />} />
      <Route path="physical/system-administrator/create-user" element={<PhysicalCreateUserPage />} />
      <Route path="physical/system-administrator/roles" element={<PhysicalRolesPage />} />
      <Route path="physical/system-administrator/audit-logs" element={<PhysicalAuditLogsPage />} />
      <Route path="physical/system-administrator/system-settings" element={<PhysicalSystemSettingsPage />} />
      <Route path="physical/system-administrator/security-alerts" element={<PhysicalSecurityAlertsPage />} />
      <Route path="physical/system-administrator/material-types" element={<MaterialTypesPage />} />
      <Route path="physical/system-administrator/categories" element={<CategoriesPage />} />
      <Route path="physical/system-administrator/publishers" element={<PublishersPage />} />
      <Route path="physical/system-administrator/languages" element={<LanguagesPage />} />
      <Route path="physical/system-administrator/subjects" element={<SubjectsPage />} />
      <Route path="physical/system-administrator/contributors" element={<ContributorsPage />} />
      <Route path="physical/system-administrator/branches" element={<BranchesPage />} />
      <Route path="physical/system-administrator/locations" element={<LocationsPage />} />
      <Route path="physical/system-administrator/member-types" element={<MemberTypesPage />} />

      <Route path="digital/digital-librarian/dashboard" element={<DigitalLibrarianDashboardPage />} />
      <Route path="digital/digital-librarian/resources" element={<DigitalResourcesPage />} />
      <Route path="digital/digital-librarian/new-resource" element={<DigitalNewPage />} />
      <Route path="digital/digital-librarian/metadata" element={<DigitalMetadataPage />} />
      <Route path="digital/digital-librarian/access" element={<DigitalAccessPage />} />
      <Route path="digital/digital-librarian/approvals" element={<DigitalApprovalsPage />} />
      <Route path="digital/digital-librarian/collections" element={<DigitalCollectionsPage />} />
      <Route path="digital/digital-librarian/analytics" element={<DigitalAnalyticsPage />} />
      <Route path="digital/digital-librarian/workflow" element={<SubmissionWorkflowPage />} />

      <Route path="digital/content-uploader/dashboard" element={<ContentUploaderDashboardPage />} />
      <Route path="digital/content-uploader/upload" element={<ContentUploaderUploadPage />} />
      <Route path="digital/content-uploader/submissions" element={<ContentUploaderSubmissionsPage />} />
      <Route path="digital/content-uploader/metadata" element={<ContentUploaderMetadataPage />} />

      <Route path="digital/member/dashboard" element={<DigitalMemberDashboardPage />} />
      <Route path="digital/member/library" element={<MemberDigitalLibraryPage />} />
      <Route path="digital/member/account" element={<DigitalMemberAccountPage />} />

      <Route path="digital/admin/dashboard" element={<DigitalAdminDashboardPage />} />
      <Route path="digital/admin/users" element={<DigitalAdminUsersPage />} />
      <Route path="digital/admin/system-settings" element={<DigitalAdminSystemSettingsPage />} />
      <Route path="digital/admin/audit-logs" element={<DigitalAdminAuditLogsPage />} />

      <Route path="digital/external-publisher/dashboard" element={<ExternalPublisherDashboardPage />} />
      <Route path="digital/external-publisher/packages" element={<ExternalPublisherPackagesPage />} />

      <Route path="settings/material-types" element={<MaterialTypesPage />} />
      <Route path="settings/categories" element={<CategoriesPage />} />
      <Route path="settings/publishers" element={<PublishersPage />} />
      <Route path="settings/languages" element={<LanguagesPage />} />
      <Route path="settings/subjects" element={<SubjectsPage />} />
      <Route path="admin/users" element={<PhysicalAdminUsersPage />} />
      <Route path="audit-logs" element={<PhysicalAuditLogsPage />} />
      <Route path="account" element={<PhysicalMemberAccountPage />} />

      <Route path="*" element={<Navigate to="/library-dashboard" replace />} />
    </Routes>
  );
}
