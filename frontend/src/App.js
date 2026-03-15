import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Users from "./pages/Users";
import Roles from "./pages/Roles";
import Permissions from "./pages/Permissions";
import RolePermissions from "./pages/RolePermissions";
import ProtectedRoute from "./components/ProtectedRoute";
import UserRoles from "./pages/UserRoles";
import Modules from "./pages/Modules";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import LibraryDashboard from "./pages/dashboards/library-dashboard";
import Dashboard from "./pages/dashboards/Dashboard";
 
import Landing from "./pages/LandingPage/Landing";
 
import Home from "./landing/pages/Home";
 

import LibraryMemberDashboardPage from "./pages/library/member/dashboard.jsx";
import LibraryContentUploaderDashboard from "./pages/library/uploader/dashboard.jsx";
import LibraryInventoryManagerDashboard from "./pages/library/inventory/dashboard.jsx";
import LibraryAcquisitionOfficerDashboard from "./pages/library/acquisition/dashboard.jsx";
import LibraryCatalogerDashboard from "./pages/library/cataloger/dashboard.jsx";
import LibraryLibrarianDashboard from "./pages/library/librarian/dashboard.jsx";
import LibraryManagerDashboard from "./pages/library/manager/dashboard.jsx";
import LibraryAdminDashboard from "./pages/library/admin/dashboard.jsx";
import LibraryModuleRoutes from "./pages/library/LibraryModuleRoutes.jsx";

import MaterialTypesPage from "./pages/library/settings/MaterialTypesPage";
import CategoriesPage from "./pages/library/settings/CategoriesPage";
import PublishersPage from "./pages/library/settings/PublishersPage";
import LanguagesPage from "./pages/library/settings/LanguagesPage";
import SubjectsPage from "./pages/library/settings/SubjectsPage";
import LibraryAccountPage from "./pages/library/member/AccountPage";
import LibraryLogsPage from "./pages/library/admin/LibraryLogsPage";
import LibraryAdminUsersPage from "./pages/library/admin/LibraryAdminUsersPage";
import LibraryPage from "./landing/pages/LibraryPage";
import InventoryReportsPage from "./pages/library/manager/InventoryReportsPage";

import EbookDashboardPage from "./pages/ebook/EbookDashboardPage";
import EbookSubmissionsPage from "./pages/ebook/EbookSubmissionsPage";
import EbookSubmissionCreatePage from "./pages/ebook/EbookSubmissionCreatePage";
import EbookSubmissionEditPage from "./pages/ebook/EbookSubmissionEditPage";
import EbookSubmissionDetailPage from "./pages/ebook/EbookSubmissionDetailPage";
import EbookReviewerPage from "./pages/ebook/EbookReviewerPage";
import EbookPublicationsPage from "./pages/ebook/EbookPublicationsPage";
import PublicEbookAuthorRegisterPage from "./pages/ebook/PublicEbookAuthorRegisterPage";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/auth" element={<Login />} />

        <Route path="/users" element={ <ProtectedRoute> <Users /> </ProtectedRoute>}/>
        <Route path="/roles" element={ <ProtectedRoute> <Roles /></ProtectedRoute>}/>
        <Route path="/permissions"  element={ <ProtectedRoute><Permissions /></ProtectedRoute> }/>
        <Route path="/role-permissions" element={ <ProtectedRoute> <RolePermissions /> </ProtectedRoute>} />
        <Route path="/user-roles/:uuid" element={ <ProtectedRoute><UserRoles /></ProtectedRoute> }/>
        <Route path="/modules"element={ <ProtectedRoute> <Modules /></ProtectedRoute> }/>

        <Route path="/admin-dashboard" element={<ProtectedRoute> <AdminDashboard /></ProtectedRoute>}/>




        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute> }/>

        <Route path="/library-dashboard" element={<LibraryDashboard />} />
        <Route path="/library/member/dashboard" element={<LibraryMemberDashboardPage />} />
        <Route path="/library/uploader/dashboard" element={<LibraryContentUploaderDashboard />} />
        <Route path="/library/inventory/dashboard" element={<LibraryInventoryManagerDashboard />} />
        <Route path="/library/acquisition/dashboard"element={<LibraryAcquisitionOfficerDashboard />}/>
        <Route path="/library/cataloger/dashboard" element={<LibraryCatalogerDashboard />}/>
        <Route path="/library/librarian/dashboard" element={<LibraryLibrarianDashboard />}/>
        <Route path="/library/manager/dashboard"element={<LibraryManagerDashboard />}/>
        <Route path="/library/admin/dashboard" element={<LibraryAdminDashboard />}/>
        <Route path="/library/settings/material-types" element={<MaterialTypesPage />} />
        <Route path="/library/settings/categories" element={<CategoriesPage />} />
        <Route path="/library/settings/publishers" element={<PublishersPage />} />
        <Route path="/library/settings/languages" element={<LanguagesPage />} />
        <Route path="/library/settings/subjects" element={<SubjectsPage />} />
        <Route path="/library/audit-logs" element={<LibraryLogsPage />} />
        <Route path="/library/admin/users" element={<LibraryAdminUsersPage />} />
        <Route path="/library/manager/inventory-reports" element={<InventoryReportsPage />} />
        <Route path="/library/account" element={<LibraryAccountPage />} />
        <Route path="/library/*" element={ <ProtectedRoute> <LibraryModuleRoutes /> </ProtectedRoute> }/>

        <Route path="/ebook/dashboard" element={<ProtectedRoute><EbookDashboardPage /></ProtectedRoute>} />
        <Route path="/ebook/author-register" element={<PublicEbookAuthorRegisterPage />} />
        <Route path="/ebook/submissions" element={<ProtectedRoute><EbookSubmissionsPage /></ProtectedRoute>} />
        <Route path="/ebook/submissions/create" element={<ProtectedRoute><EbookSubmissionCreatePage /></ProtectedRoute>} />
        <Route path="/ebook/submissions/:id/edit" element={<ProtectedRoute><EbookSubmissionEditPage /></ProtectedRoute>} />
        <Route path="/ebook/submissions/:id" element={<ProtectedRoute><EbookSubmissionDetailPage /></ProtectedRoute>} />
        <Route path="/ebook/reviewer" element={<ProtectedRoute><EbookReviewerPage /></ProtectedRoute>} />
        <Route path="/ebook/publications" element={<ProtectedRoute><EbookPublicationsPage /></ProtectedRoute>} />

        <Route path="/ora" element={<Landing />} />


         

      </Routes>
    </BrowserRouter>
  );
}

export default App;