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
import ManuscriptionList from "./pages/journals/manuscriptions/pages/ManuscriptionList";
import ManuscriptStatuses from "./pages/manuscription/ManuscriptStatuses";
import ManuscriptShow from "./pages/journals/manuscriptions/pages/ManuscriptShow";
import ManuscriptEdit from "./pages/journals/manuscriptions/pages/ManuscriptEdit";
import CreateManuscript from "./pages/journals/manuscriptions/pages/CreateManuscript";
import DraftManuscription from "./pages/journals/manuscriptions/pages/DraftManuscription";
import RevisionRequiredManuscription from "./pages/journals/manuscriptions/pages/RevisionRequiredManuscription";
import MyInvitedCoAuthors from "./pages/journals/manuscriptions/pages/MyInvitedCoAuthors";
import RepositoryAuthorDashboard from "./pages/dashboards/repository/RepositoryAuthorDashboard";
import RepositoryList from "./pages/repository/RepositoryList";
import RepositoryCreate from "./pages/repository/RepositoryCreate";
import RepositoryShow from "./pages/repository/RepositoryShow";
import RepositoryEdit from "./pages/repository/RepositoryEdit";
import CuratorDashboard from "./pages/dashboards/repository/CuratorDashboard";
import CuratorRepositoryList from "./pages/repository/CuratorRepositoryList";
import CuratorRepositoryReview from "./pages/repository/CuratorRepositoryReview";
import InProgress from "./pages/repository/InProgress";
import ReadyToApprove from "./pages/repository/ReadyToApprove";
import ReturnToRevision from "./pages/repository/ReturnToRevision";
import DraftRepository from "./pages/repository/DraftRepository";
import DepositsUnderReview from "./pages/repository/DepositsUnderReview";
import DepositsReturned from "./pages/repository/DepositsReturned";
import ApprovedDeposits from "./pages/repository/ApprovedDeposits";
import RepositorySearch from "./pages/repository/RepositorySearch";
import RepositoryShowAuthor from "./pages/repository/RepositoryShowAuthor";
import CuratorTool from "./pages/repository/curators/CuratorTool";
import CollectionsByAuthor from "./pages/repository/curators/CollectionsByAuthor";
import CollectionsByType from "./pages/repository/curators/CollectionsByType";
import RepositoryTrends from "./pages/repository/curators/RepositoryTrends";
import RepositoryTimelinessReport from "./pages/repository/curators/RepositoryTimelinessReport";
import CuratorPerformanceReport from "./pages/repository/curators/CuratorPerformanceReport";
import ReviewerDashboard from "./pages/repository/reviewer/ReviewerDashboard";
import ReviewerQueueNew from "./pages/repository/reviewer/ReviewerQueueNew";
import ReviewerItemDetail from "./pages/repository/reviewer/ReviewerItemDetail";
import PublicRepository from "./pages/repository/publicUsers/PublicRepository";
import PublicRepositoryDetail from "./pages/repository/publicUsers/PublicRepositoryDetail";
import PublicLogin from "./pages/repository/publicUsers/PublicLogin";
import PublicRegister from "./pages/publicusers/PublicRegister";
import PublicLayout from "./components/layout/PublicLayout";
import PublicSearch from "./pages/publicusers/PublicSearch";
import PublicDashboard from "./pages/publicusers/PublicDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roles"
          element={
            <ProtectedRoute>
              <Roles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/permissions"
          element={
            <ProtectedRoute>
              <Permissions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/role-permissions"
          element={
            <ProtectedRoute>
              <RolePermissions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-roles/:uuid"
          element={
            <ProtectedRoute>
              <UserRoles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/modules"
          element={
            <ProtectedRoute>
              <Modules />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance-dashboard"
          element={
            <ProtectedRoute>
              <FinanceDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/book-dashboard" element={<BookDashboard />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/library-dashboard" element={<LibraryDashboard />} />

        <Route path="/wikipedia-dashboard" element={<WikipediaDashboard />} />
        <Route
          path="/researcher-dashboard"
          element={<ResearchersDashboard />}
        />

        {/* Journal Dashboard */}
        <Route
          path="/journal-dashboard"
          element={
            <ProtectedRoute>
              <JournalDashboard />
            </ProtectedRoute>
          }
        />

        {/* /repository/users */}

        {/* Journal Users */}
        <Route
          path="/journal/users"
          element={
            <ProtectedRoute>
              <JournalUserList />
            </ProtectedRoute>
          }
        />

        {/* //Repository Authors */}
        <Route path="/repository-dashboard" element={<RepositoryDashboard />} />

        {/* /repository/author/dashboard */}
        <Route
          path="/repository/author/dashboard"
          element={
            <ProtectedRoute>
              <RepositoryAuthorDashboard />
            </ProtectedRoute>
          }
        />
        {/* repository/curator/dashboard */}
 <Route
          path="/repository/curator/dashboard"
          element={
            <ProtectedRoute>
              <CuratorDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/repository/curator/queue/new"
          element={
            <ProtectedRoute>
              <CuratorRepositoryList />
            </ProtectedRoute>
          }
        />

         <Route
          path="repository/author/deposits/drafts"
          element={
            <ProtectedRoute>
              <DraftRepository />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/repository/collections/author"
          element={
            <ProtectedRoute>
              <CollectionsByAuthor />
            </ProtectedRoute>
          }
        />

 <Route
          path="/repository/reports/curator-performance"
          element={
            <ProtectedRoute>
              <CuratorPerformanceReport />
            </ProtectedRoute>
          }
        />

         <Route
          path="/repository/reviewer/dashboard"
          element={
            <ProtectedRoute>
              <ReviewerDashboard />
            </ProtectedRoute>
          }
        />


<Route
          path="/repository/reviewer/queue/new"
          element={
            <ProtectedRoute>
              <ReviewerQueueNew />
            </ProtectedRoute>
          }
        />
        <Route
          path="/repository/reviewer/review/:uuid"
          element={
            <ProtectedRoute>
              <ReviewerItemDetail />
            </ProtectedRoute>
          }
        />
       <Route path="/repository/public" element={<PublicRepository />} />
        <Route path="/repository/:uuid" element={<PublicRepositoryDetail />} />


          <Route
          path="/register"
          element={<PublicRegister />}
        />
      <Route path="/public/login" element={<PublicLogin />} />
      <Route path="/public/dashboard" element={<PublicDashboard />} />


      <Route path="/repository/public" element={<PublicLayout />}>
        <Route path="search" element={<PublicSearch />} />
      </Route>

        <Route
          path="/repository/collections/type"
          element={
            <ProtectedRoute>
              <CollectionsByType />
            </ProtectedRoute>
          }
        />
 <Route
          path="/repository/reports/trends"
          element={
            <ProtectedRoute>
              <RepositoryTrends />
            </ProtectedRoute>
          }
        />
        
           <Route
          path="repository/curator/review/:uuid"
          element={
            <ProtectedRoute>
              <CuratorRepositoryReview />
            </ProtectedRoute>
          }
        />

           <Route
          path="/repository/author/deposits/review"
          element={
            <ProtectedRoute>
              <DepositsUnderReview />
            </ProtectedRoute>
          }
        />

            <Route
          path="/repository/author/deposits/returned"
          element={
            <ProtectedRoute>
              <DepositsReturned />
            </ProtectedRoute>
          }
        />
       

        <Route path="repository/curator/queue/in-progress" element={<InProgress />} />
<Route path="repository/curator/queue/ready" element={<ReadyToApprove />} />
<Route path="/repository/curator/queue/returned" element={<ReturnToRevision />} />
        <Route
          path="/repository/users"
          element={
            <ProtectedRoute>
              <JournalUserList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/repository/author/submit/list"
          element={
            <ProtectedRoute>
              <RepositoryList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/repository/create"
          element={
            <ProtectedRoute>
              <RepositoryCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/repository/show/:uuid"
          element={
            <ProtectedRoute>
              <RepositoryShow />
            </ProtectedRoute>
          }
        />

<Route
          path="/repository/curator/tools"
          element={
            <ProtectedRoute>
              <CuratorTool />
            </ProtectedRoute>
          }
        />

        <Route
          path="/repository/author/show/:uuid"
          element={
            <ProtectedRoute>
              <RepositoryShowAuthor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/repository/edit/:uuid"
          element={
            <ProtectedRoute>
              <RepositoryEdit />
            </ProtectedRoute>
          }
        />
<Route
          path="/repository/author/deposits/approved"
          element={
            <ProtectedRoute>
              <ApprovedDeposits />
            </ProtectedRoute>
          }
        />

        <Route
          path="/repository/search"
          element={
            <ProtectedRoute>
              <RepositorySearch />
            </ProtectedRoute>
          }
        />

        <Route
          path="/module/users/add"
          element={
            <ProtectedRoute>
              <JournalAddUser />
            </ProtectedRoute>
          }
        />

        {/* Journal Management */}
        <Route
          path="/journal/list"
          element={
            <ProtectedRoute>
              <JournalList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal/add"
          element={
            <ProtectedRoute>
              <JournalForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal/edit/:id"
          element={
            <ProtectedRoute>
              <JournalEdit />
            </ProtectedRoute>
          }
        />

        {/* Manuscription Routes */}

        <Route
          path="/journal/manuscraipts/create"
          element={
            <ProtectedRoute>
              <CreateManuscript />
            </ProtectedRoute>
          }
        />

        <Route
          path="/journal/coauthors/my-invitations"
          element={
            <ProtectedRoute>
              <MyInvitedCoAuthors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal/manuscripts"
          element={
            <ProtectedRoute>
              <ManuscriptionList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal/manuscripts-status"
          element={
            <ProtectedRoute>
              <ManuscriptStatuses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/journal/draft-manuscript"
          element={
            <ProtectedRoute>
              <DraftManuscription />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal/manuscripts/revisions"
          element={
            <ProtectedRoute>
              <RevisionRequiredManuscription />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal/manuscripts/edit/:id"
          element={<ManuscriptEdit />}
        />

        <Route
          path="/journal/manuscripts/show/:id"
          element={<ManuscriptShow />}
        />
        <Route
          path="/library/users"
          element={
            <ProtectedRoute>
              <JournalUserList />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
