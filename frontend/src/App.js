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
import JournalUserList from "./pages/journals/users/pages/UserList";
import JournalAddUser from "./pages/journals/users/pages/AddUser";
import JournalForm from "./components/journal/JournalForm";
import JournalEdit from "./pages/journals/journal/pages/JournalEdit";
import JournalList from "./pages/journals/journal/pages/JournalList";
import ManuscriptionList from "./pages/journals/manuscriptions/pages/ManuscriptionList";
import ManuscriptStatuses from "./pages/manuscription/ManuscriptStatuses";
import ManuscriptShow from "./pages/journals/manuscriptions/pages/ManuscriptShow";
import ManuscriptEdit from "./pages/manuscription/ManuscriptEdit";
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
import ArticleList from "./pages/wiki/ArticleList";
import ArticleCreate from "./pages/wiki/ArticleCreate";
import ArticleEdit from "./pages/wiki/ArticleEdit";
import ArticleDraftList from "./pages/wiki/ArticleDraftList";
import WikiCategoryList from "./pages/wikicategory/WikiCategoryList";
import WikiCategoryForm from "./pages/wikicategory/WikiCategoryForm";
import Landing from "./pages/LandingPage/Landing";
import JournalProfile from "./pages/journals/journal/pages/JournalProfile";
import JournalAuthorDashboard from "./pages/dashboards/journals/author/JournalAuthorDashboard";
import EICSubmissions from "./pages/journals/eic/EICSubmissions";
import AssignEditors from "./pages/journals/eic/AssignEditors";
import FinalDecisions from "./pages/journals/eic/FinalDecisions";
import EICManuscriptDetails from "./pages/journals/eic/EICManuscriptDetails";
import EthicsScreen from "./pages/journals/eic/EthicsScreen";
import ProductionScreen from "./pages/journals/eic/ProductionScreen";
import AssignedManuscripts from "./pages/journals/ae/AssignedManuscripts";
import InitialScreening from "./pages/journals/ae/InitialScreening";
import Recommendations from "./pages/journals/ae/Recommendations";
import Ethics from "./pages/journals/ae/Ethics";
import ReviewEvaluation from "./pages/journals/ae/ReviewEvaluation";
import Production from "./pages/journals/ae/Production";
import AssignedReviews from "./pages/journals/reviewer/AssignedReviews";
import ReviewerWorkspace from "./pages/journals/reviewer/ReviewerWorkspace";
import SubmitReview from "./pages/journals/reviewer/SubmitReview";
import ResearcherRegister from "./pages/researcher/ResearcherRegister";
import ResearcherProfile from "./pages/researcher/ResearcherProfile";
import PublicHome from "./pages/researcher/PublicHome";
import ResearcherLogin from "./pages/researcher/ResearcherLogin";
import ResearcherDashboard from "./components/researcher/ResearcherDashboard";
import ProfileOnboarding from "./pages/researcher/ProfileOnboarding";
import Groups from "./pages/researcher/Groups";
import GroupForm from "./pages/researcher/GroupForm";
import AdminGroups from "./pages/researcher/groups/AdminGroups";
import AdminGroupDetails from "./pages/researcher/groups/AdminGroupDetails";
import AssignedReviewDetails from "./pages/journals/reviewer/AssignedReviewDetails";
import Home from "./landing/pages/Home";
import Repository from "./landing/pages/Repository";
import Ebooks from "./landing/pages/Ebooks";
import Network from "./landing/pages/Network";
import JournalPage from "./landing/pages/JournalPage";
import LibraryPage from "./landing/pages/LibraryPage";
import OromoWikipedia from "./landing/pages/OromoWikipedia";
import JoinForm from "./landing/components/JoinForm";
import JournalAuthorRegistrationForm from "./pages/journals/authors/JournalAuthorRegistrationForm";
import WorkflowStages from "./pages/manuscription/workflowstages/WorkflowStages";
import ManuscriptList from "./pages/manuscription/ManuscriptList";
import ManuscriptCreate from "./pages/manuscription/ManuscriptCreate";
import ManuscriptListAE from "./pages/manuscription/ae/ManuscriptListAE";
import DraftManuscripts from "./pages/manuscription/DraftManuscripts";
import InitialScreeningListAE from "./pages/manuscription/ae/InitialScreeningListAE";
import EICCompletedReviews from "./pages/manuscription/eic/EICCompletedReviews";
import EICMakeDecision from "./pages/manuscription/eic/EICMakeDecision";
import EICPaymentOrders from "./pages/manuscription/eic/EICPaymentOrders";
import RegisterPage from "./pages/wiki/users/RegisterPage";
import WikiLoginPage from "./pages/wiki/users/WikiLoginPage";
import WikiDashboard from "./pages/wiki/WikiDashboard";
import CreateArticlePage from "./pages/wiki/CreateArticlePage";
import WikiArticlePage from "./pages/wiki/WikiArticlePage";
import WikiMediaUploadPage from "./pages/wiki/media/WikiMediaUploadPage";
import WikiMediaGalleryPage from "./pages/wiki/media/WikiMediaGalleryPage";
import EbookAuthorRegistrationForm from "./pages/ebooks/users/EbookAuthorRegistrationForm";
import EbookDashboard from "./landing/pages/Ebooks";

import UpdateEbook from "./pages/ebooks/UpdateEbook";

import EbookManagementPage from "./pages/ebooks/EbookManagementPage";
import EBookDashboards from "./pages/ebooks/EBookDashboards";

import WikiProfileEdit from "./pages/wiki/users/WikiProfileEdit";
import ArticleDetails from "./pages/wiki/ArticleDetails";
import VandalismCheck from "./pages/wiki/VandalismCheck";

import AuthorSubmitManuscript from "./pages/ebooks/AuthorSubmitManuscript";
import AuthorMySubmissions from "./pages/ebooks/AuthorMySubmissions";
import ManuscriptDetail from "./pages/ebooks/ManuscriptDetail";
import EditManuscript from "./pages/ebooks/EditManuscript";
import EditorScreeningQueue from './pages/ebooks/EditorScreeningQueue';
import DaftManuscript from "./pages/ebooks/AuthorDrafts";
import EditorScreeningDetail from "./pages/ebooks/EditorScreeningDetail";

// ============= NEW EDITOR PAGES =============
import ScreeningQueue from "./pages/ebooks/EditorScreeningQueue";
import EditorScreeningAssessment from "./pages/ebooks/editor/EditorScreeningAssessment.jsx";
import AssignedEbooks from "./pages/ebooks/editor/AssignedEbooks.jsx";
import RejectedEbooks from "./pages/ebooks/editor/RejectedEbooks";
import ReviewSummary from "./pages/ebooks/editor/ReviewSummary.jsx";
import EditorReviewSummary from "./pages/ebooks/editor/EditorReviewSummary";
import EditorMakeDecision from "./pages/ebooks/editor/EditorMakeDecision";

// ============= NEW REVIEWER PAGES =============
import MyReviews from "./pages/ebooks/reviewer/ReviewerMyReviews";
import ReviewDetail from "./pages/ebooks/reviewer/ReviewerReviewDetail.jsx";
import CompletedReviews from "./pages/ebooks/reviewer/CompletedReviews.jsx";
import ReviewerReviewDetail from "./pages/ebooks/reviewer/ReviewerReviewDetail.jsx";
import ReviewerSubmitReview from "./pages/ebooks/reviewer/ReviewerSubmitReview.jsx";

import AuthorLogin from "./pages/ebooks/author/AuthorLogin";

// Ebook publishing extensions (Finance, Production, Public Library)
import FinancePending from "./pages/ebooks/finance/FinancePending";
import ProductionQueue from "./pages/ebooks/production/ProductionQueue";
import PublicLibrary from "./pages/ebooks/public/PublicLibrary";
import PublicEbookDetail from "./pages/ebooks/public/PublicEbookDetail";
import SubmissionRevisions from "./pages/ebooks/submissions/SubmissionRevisions.jsx";
import SubmissionReviewerComments from "./pages/ebooks/submissions/SubmissionReviewerComments.jsx";
import SubmissionFinalProof from "./pages/ebooks/submissions/SubmissionFinalProof.jsx";
import SubmissionLicense from "./pages/ebooks/submissions/SubmissionLicense.jsx";

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



/* =========================
   ✅ NEW: ORA LIBRARY IMPORTS
========================= */
 
 

 
 
 

 
 

  
 

 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/join" element={<JoinForm />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route
          path="/journal/author"
          element={<JournalAuthorRegistrationForm />}
        />
        <Route path="/journal/workflow-stages" element={<WorkflowStages />} />
        <Route path="/repository" element={<Repository />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/network" element={<Network />} />
        <Route path="/wikipedia" element={<OromoWikipedia />} />
        <Route path="/auth" element={<Login />} />

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
          path="/wiki/profile/edit"
          element={
            <ProtectedRoute>
              <WikiProfileEdit />
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
        <Route path="/library/account" element={<LibraryAccountPage />} />
        <Route
          path="/researcher-dashboard"
          element={<ResearchersDashboard />}
        />

        {/* =========================
            ✅ NEW: ORA LIBRARY ROUTES
           ========================= */}
        
       
        <Route
          path="/library/*"
          element={
            <ProtectedRoute>
              <LibraryModuleRoutes />
            </ProtectedRoute>
          }
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

        <Route
          path="/journal/author-dashboard"
          element={
            <ProtectedRoute>
              <JournalAuthorDashboard />
            </ProtectedRoute>
          }
        />

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
        <Route
          path="/repository/admin/dashboard"
          element={<RepositoryDashboard />}
        />

        <Route path="/ora" element={<Landing />} />

        {/* ... ✅ YOUR EXISTING ROUTES CONTINUE BELOW ... */}

        {/* ================= PUBLIC LIBRARY ================= */}
        <Route path="/ebook/library" element={<PublicLibrary />} />
        <Route path="/ebook/library/:id" element={<PublicEbookDetail />} />

        <Route path="/ebook/submissions/revisions" element={<SubmissionRevisions />} />
        <Route path="/ebook/submissions/reviewer-comments" element={<SubmissionReviewerComments />} />
        <Route path="/ebook/submissions/final-proof" element={<SubmissionFinalProof />} />
        <Route path="/ebook/submissions/license" element={<SubmissionLicense />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;