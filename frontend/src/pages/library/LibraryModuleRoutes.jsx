import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LibraryUsersPage from "./users/pages/userList";
import BooksBrowsePage from "./books/BooksBrowsePage";
import NewBookPage from "./books/NewBookPage";
import CopiesPage from "./books/CopiesPage";
import LoansPage from "./circulation/LoansPage";
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
import MaterialTypesPage from "./settings/MaterialTypesPage";
import CategoriesPage from "./settings/CategoriesPage";
import PublishersPage from "./settings/PublishersPage";
import LanguagesPage from "./settings/LanguagesPage";
import SubjectsPage from "./settings/SubjectsPage";
import AccountPage from "./member/AccountPage";
import LibrarySummaryPage from "../../components/library/LibrarySummaryPage";

export default function LibraryModuleRoutes() {
  return (
    <Routes>
      <Route path="users" element={<LibraryUsersPage />} />
      <Route path="users/create" element={<LibraryCreateUserPage />} />
      <Route path="roles" element={<LibraryRolesPage />} />
      <Route path="logs" element={<LibraryLogsPage />} />
      <Route path="settings" element={<LibrarySettingsPage />} />
      <Route path="policies" element={<PoliciesPage />} />
      <Route path="reports" element={<LibrarySummaryPage />} />
      <Route path="books" element={<BooksBrowsePage />} />
      <Route path="books/all" element={<BooksBrowsePage adminMode />} />
      <Route path="books/new" element={<NewBookPage />} />
      <Route path="copies" element={<CopiesPage />} />
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
      <Route path="inventory/missing" element={<MissingItemsPage />} />
      <Route path="inventory/damaged" element={<DamagedItemsPage />} />
      <Route path="inventory/tags" element={<TagsPage />} />
      <Route path="digital" element={<DigitalResourcesPage />} />
      <Route path="digital/new" element={<DigitalNewPage />} />
      <Route path="digital/metadata" element={<DigitalMetadataPage />} />
      <Route path="digital/access" element={<DigitalAccessPage />} />
      <Route path="digital/approvals" element={<DigitalApprovalsPage />} />
      <Route path="digital/analytics" element={<DigitalAnalyticsPage />} />
      <Route path="settings/material-types" element={<MaterialTypesPage />} />
      <Route path="settings/categories" element={<CategoriesPage />} />
      <Route path="settings/publishers" element={<PublishersPage />} />
      <Route path="settings/languages" element={<LanguagesPage />} />
      <Route path="settings/subjects" element={<SubjectsPage />} />
      <Route path="audit-logs" element={<LibraryLogsPage />} />
      <Route path="account" element={<AccountPage />} />
      <Route path="*" element={<Navigate to="/library/books" replace />} />
    </Routes>
  );
}
