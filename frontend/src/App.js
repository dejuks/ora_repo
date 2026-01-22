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
import FinanceDashboard from "./pages/dashboards/journal-dashboard";
import BookDashboard from "./pages/dashboards/BookDashboard";
import LibraryDashboard from "./pages/dashboards/library-dashboard";
import RepositoryDashboard from "./pages/dashboards/Repository-dashboard";
import WikipediaDashboard from "./pages/dashboards/Wikipedia-dashboard"; 
import ResearchersDashboard from "./pages/dashboards/Researchers-dashboard";
import JournalDashboard from "./pages/dashboards/journal-dashboard";
import Dashboard from "./pages/dashboards/Dashboard";
import LibraryUserList from "./pages/library/users/pages/userList";
import JournalUserList from "./pages/journals/users/pages/UserList";
import JournalAddUser from "./pages/journals/users/pages/AddUser";
import JournalForm from "./components/journal/JournalForm";
import JournalEdit from "./pages/journals/journal/pages/JournalEdit";
import JournalList from "./pages/journals/journal/pages/JournalList";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/roles" element={<ProtectedRoute><Roles /></ProtectedRoute>} />
        <Route path="/permissions" element={<ProtectedRoute><Permissions /></ProtectedRoute>} />
        <Route path="/role-permissions" element={<ProtectedRoute><RolePermissions /></ProtectedRoute>} />
        <Route path="/user-roles/:uuid" element={<ProtectedRoute><UserRoles /></ProtectedRoute>} />
        <Route path="/modules" element={<ProtectedRoute><Modules /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/finance-dashboard" element={<ProtectedRoute><FinanceDashboard /></ProtectedRoute>} />
        <Route path="/book-dashboard" element={<BookDashboard />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />  
        <Route path="/library-dashboard" element={<LibraryDashboard />} />
        <Route path="/repository-dashboard" element={<RepositoryDashboard />} />
        <Route path="/wikipedia-dashboard" element={<WikipediaDashboard />} />
        <Route path="/researcher-dashboard" element={<ResearchersDashboard />} />

      {/* Journal Dashboard */}
        <Route path="/journal-dashboard" element={<ProtectedRoute><JournalDashboard /></ProtectedRoute>} />

        {/* Journal Users */}
        <Route path="/journal/users" element={<ProtectedRoute><JournalUserList /></ProtectedRoute>} />
        <Route path="/module/users/add" element={<ProtectedRoute><JournalAddUser /></ProtectedRoute>} />

        {/* Journal Management */}
        <Route path="/journal/list" element={<ProtectedRoute><JournalList /></ProtectedRoute>} />
        <Route path="/journal/add" element={<ProtectedRoute><JournalForm /></ProtectedRoute>} />
        <Route path="/journal/edit/:id" element={<ProtectedRoute><JournalEdit /></ProtectedRoute>} />

        
        
        <Route path="/library/users" element={<ProtectedRoute><JournalUserList /></ProtectedRoute>} />
        

      </Routes>
    </BrowserRouter>
  );
}

export default App;
