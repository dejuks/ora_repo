import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LibraryUsersPage from "./users/pages/userList";
import BooksBrowsePage from "./books/BooksBrowsePage";
import NewBookPage from "./books/NewBookPage";
import CopiesPage from "./books/CopiesPage";
import LoansPage from "./circulation/LoansPage";
import CirculationDeskPage from "./circulation/CirculationDeskPage";
import MyLoansPage from "./circulation/MyLoansPage";
import HoldsPage from "./circulation/HoldsPage";
import MyHoldsPage from "./circulation/MyHoldsPage";
import FinesPage from "./circulation/FinesPage";
import MyFinesPage from "./circulation/MyFinesPage";
import HistoryPage from "./circulation/HistoryPage";
import PoliciesPage from "./management/PoliciesPage";
import RequestsPage from "./acquisitions/RequestsPage";
import OrdersPage from "./acquisitions/OrdersPage";
import DeliveriesPage from "./acquisitions/DeliveriesPage";
import ApprovalsPage from "./acquisitions/ApprovalsPage";
import VendorsPage from "./acquisitions/VendorsPage";
import AuditsPage from "./inventory/AuditsPage";
import MissingItemsPage from "./inventory/MissingItemsPage";
import DamagedItemsPage from "./inventory/DamagedItemsPage";
import TagsPage from "./inventory/TagsPage";
import InventoryReportPage from "./inventory/InventoryReportPage";
import DigitalResourcesPage from "./digital/DigitalResourcesPage";
import DigitalNewPage from "./digital/DigitalNewPage";
import DigitalMetadataPage from "./digital/DigitalMetadataPage";
import DigitalAccessPage from "./digital/DigitalAccessPage";
import DigitalApprovalsPage from "./digital/DigitalApprovalsPage";
import DigitalAnalyticsPage from "./digital/DigitalAnalyticsPage";
import LibraryRolesPage from "./admin/LibraryRolesPage";
import LibraryLogsPage from "./admin/LibraryLogsPage";
import LibrarySettingsPage from "./admin/LibrarySettingsPage";
import LibraryCreateUserPage from "./admin/LibraryCreateUserPage";
import LibraryAdminUsersPage from "./admin/LibraryAdminUsersPage";
import MaterialTypesPage from "./settings/MaterialTypesPage";
import CategoriesPage from "./settings/CategoriesPage";
import PublishersPage from "./settings/PublishersPage";
import LanguagesPage from "./settings/LanguagesPage";
import SubjectsPage from "./settings/SubjectsPage";
import ContributorsPage from "./settings/ContributorsPage";
import BranchesPage from "./settings/BranchesPage";
import LocationsPage from "./settings/LocationsPage";
import MemberTypesPage from "./settings/MemberTypesPage";
import CatalogMetadataPage from "./books/CatalogMetadataPage";
import DigitalCollectionsPage from "./digital/DigitalCollectionsPage";
import AccountPage from "./member/AccountPage";
import CatalogingToolsPage from "./cataloger/CatalogingToolsPage";
import LibrarySummaryPage from "../../components/library/LibrarySummaryPage";
import LoanReportsPage from "./manager/LoanReportsPage";
import UsageReportsPage from "./manager/UsageReportsPage";
import InventoryReportsPage from "./manager/InventoryReportsPage";
import LibrarySystemSettingsPage from "./admin/LibrarySystemSettingsPage";
import LibrarySecurityAlertsPage from "./admin/LibrarySecurityAlertsPage";
import ExternalPublisherPackagesPage from "./digital/ExternalPublisherPackagesPage";
import SubmissionWorkflowPage from "./digital/SubmissionWorkflowPage";
import OpacSearchPage from "./member/OpacSearchPage";
import MemberDigitalLibraryPage from "./member/MemberDigitalLibraryPage";

export default function LibraryModuleRoutes() {
  return (
    <Routes>
      <Route path="users" element={<LibraryUsersPage />} />
      <Route path="admin/users" element={<LibraryAdminUsersPage />} />
      <Route path="users/create" element={<LibraryCreateUserPage />} />
      <Route path="roles" element={<LibraryRolesPage />} />
      <Route path="logs" element={<LibraryLogsPage />} />
      <Route path="settings" element={<LibrarySettingsPage />} />
      <Route path="policies" element={<PoliciesPage />} />
      <Route path="reports" element={<LibrarySummaryPage />} />
      <Route path="books" element={<BooksBrowsePage />} />
      <Route path="books/all" element={<BooksBrowsePage adminMode />} />
      <Route path="books/new" element={<NewBookPage />} />
      <Route path="books/metadata" element={<CatalogMetadataPage />} />
      <Route path="cataloger/tools" element={<CatalogingToolsPage />} />
      <Route path="copies" element={<CopiesPage />} />
      <Route path="circulation/desk" element={<CirculationDeskPage />} />
      <Route path="loans" element={<LoansPage />} />
      <Route path="my-loans" element={<MyLoansPage />} />
      <Route path="holds" element={<HoldsPage />} />
      <Route path="my-holds" element={<MyHoldsPage />} />
      <Route path="fines" element={<FinesPage />} />
      <Route path="my-fines" element={<MyFinesPage />} />
      <Route path="history" element={<HistoryPage />} />
      <Route path="acquisitions/requests" element={<RequestsPage />} />
      <Route path="acquisitions/orders" element={<OrdersPage />} />
      <Route path="acquisitions/deliveries" element={<DeliveriesPage />} />
      <Route path="acquisitions/approvals" element={<ApprovalsPage />} />
      <Route path="vendors" element={<VendorsPage />} />
      <Route path="inventory/audits" element={<AuditsPage />} />
      <Route path="inventory/report" element={<InventoryReportPage />} />
      <Route path="inventory/missing" element={<MissingItemsPage />} />
      <Route path="inventory/damaged" element={<DamagedItemsPage />} />
      <Route path="inventory/tags" element={<TagsPage />} />
      <Route path="digital" element={<DigitalResourcesPage />} />
      <Route path="digital/new" element={<DigitalNewPage />} />
      <Route path="digital/metadata" element={<DigitalMetadataPage />} />
      <Route path="digital/access" element={<DigitalAccessPage />} />
      <Route path="digital/approvals" element={<DigitalApprovalsPage />} />
      <Route path="digital/collections" element={<DigitalCollectionsPage />} />
      <Route path="digital/analytics" element={<DigitalAnalyticsPage />} />

      <Route path="opac" element={<OpacSearchPage />} />
      <Route path="member/digital" element={<MemberDigitalLibraryPage />} />
      <Route path="digital/workflow/:id" element={<SubmissionWorkflowPage />} />
      <Route path="digital/publisher-packages" element={<ExternalPublisherPackagesPage />} />
      <Route path="admin/security-alerts" element={<LibrarySecurityAlertsPage />} />
      <Route path="admin/system-settings" element={<LibrarySystemSettingsPage />} />
      <Route path="manager/usage-reports" element={<UsageReportsPage />} />
      <Route path="manager/loan-reports" element={<LoanReportsPage />} />
      <Route path="manager/inventory-reports" element={<InventoryReportsPage />} />
      <Route path="settings/material-types" element={<MaterialTypesPage />} />
      <Route path="settings/categories" element={<CategoriesPage />} />
      <Route path="settings/publishers" element={<PublishersPage />} />
      <Route path="settings/languages" element={<LanguagesPage />} />
      <Route path="settings/subjects" element={<SubjectsPage />} />
      <Route path="settings/contributors" element={<ContributorsPage />} />
      <Route path="settings/branches" element={<BranchesPage />} />
      <Route path="settings/locations" element={<LocationsPage />} />
      <Route path="settings/member-types" element={<MemberTypesPage />} />
      <Route path="audit-logs" element={<LibraryLogsPage />} />
      <Route path="account" element={<AccountPage />} />
      <Route path="*" element={<Navigate to="/library/books" replace />} />
    </Routes>
  );
}
