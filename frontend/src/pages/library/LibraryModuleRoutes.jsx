import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LibraryUsersPage from "./users/pages/userList.jsx";
import BooksBrowsePage from "./books/BooksBrowsePage.jsx";
import NewBookPage from "./books/NewBookPage.jsx";
import CopiesPage from "./books/CopiesPage.jsx";
import LoansPage from "./circulation/LoansPage.jsx";
import CirculationDeskPage from "./circulation/CirculationDeskPage.jsx";
import MyLoansPage from "./circulation/MyLoansPage.jsx";
import HoldsPage from "./circulation/HoldsPage.jsx";
import MyHoldsPage from "./circulation/MyHoldsPage.jsx";
import FinesPage from "./circulation/FinesPage.jsx";
import MyFinesPage from "./circulation/MyFinesPage.jsx";
import HistoryPage from "./circulation/HistoryPage.jsx";
import PoliciesPage from "./management/PoliciesPage.jsx";
import RequestsPage from "./acquisitions/RequestsPage.jsx";
import OrdersPage from "./acquisitions/OrdersPage.jsx";
import DeliveriesPage from "./acquisitions/DeliveriesPage.jsx";
import ApprovalsPage from "./acquisitions/ApprovalsPage.jsx";
import VendorsPage from "./acquisitions/VendorsPage.jsx";
import AuditsPage from "./inventory/AuditsPage.jsx";
import MissingItemsPage from "./inventory/MissingItemsPage.jsx";
import DamagedItemsPage from "./inventory/DamagedItemsPage.jsx";
import TagsPage from "./inventory/TagsPage.jsx";
import InventoryReportPage from "./inventory/InventoryReportPage.jsx";
import DigitalResourcesPage from "./digital/DigitalResourcesPage.jsx";
import DigitalNewPage from "./digital/DigitalNewPage.jsx";
import DigitalMetadataPage from "./digital/DigitalMetadataPage.jsx";
import DigitalAccessPage from "./digital/DigitalAccessPage.jsx";
import DigitalApprovalsPage from "./digital/DigitalApprovalsPage.jsx";
import DigitalAnalyticsPage from "./digital/DigitalAnalyticsPage.jsx";
import LibraryRolesPage from "./admin/LibraryRolesPage.jsx";
import LibraryLogsPage from "./admin/LibraryLogsPage.jsx";
import LibrarySettingsPage from "./admin/LibrarySettingsPage.jsx";
import LibraryCreateUserPage from "./admin/LibraryCreateUserPage.jsx";
import LibraryAdminUsersPage from "./admin/LibraryAdminUsersPage.jsx";
import MaterialTypesPage from "./settings/MaterialTypesPage.jsx";
import CategoriesPage from "./settings/CategoriesPage.jsx";
import PublishersPage from "./settings/PublishersPage.jsx";
import LanguagesPage from "./settings/LanguagesPage.jsx";
import SubjectsPage from "./settings/SubjectsPage.jsx";
import ContributorsPage from "./settings/ContributorsPage.jsx";
import BranchesPage from "./settings/BranchesPage.jsx";
import LocationsPage from "./settings/LocationsPage.jsx";
import MemberTypesPage from "./settings/MemberTypesPage.jsx";
import CatalogMetadataPage from "./books/CatalogMetadataPage.jsx";
import DigitalCollectionsPage from "./digital/DigitalCollectionsPage.jsx";
import AccountPage from "./member/AccountPage.jsx";
import CatalogingToolsPage from "./cataloger/CatalogingToolsPage.jsx";
import LibrarySummaryPage from "../../components/library/LibrarySummaryPage.jsx";
import LoanReportsPage from "./manager/LoanReportsPage.jsx";
import UsageReportsPage from "./manager/UsageReportsPage.jsx";
import InventoryReportsPage from "./manager/InventoryReportsPage.jsx";
import LibrarySystemSettingsPage from "./admin/LibrarySystemSettingsPage.jsx";
import LibrarySecurityAlertsPage from "./admin/LibrarySecurityAlertsPage.jsx";
import ExternalPublisherPackagesPage from "./digital/ExternalPublisherPackagesPage.jsx";
import SubmissionWorkflowPage from "./digital/SubmissionWorkflowPage.jsx";
import OpacSearchPage from "./member/OpacSearchPage.jsx";
import MemberDigitalLibraryPage from "./member/MemberDigitalLibraryPage.jsx";

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
