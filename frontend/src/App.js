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
import JournalDetailPage from "./landing/pages/PublicManuscriptDetailPage";
import LibraryPage from "./landing/pages/LibraryPage";
import OromoWikipedia from "./landing/pages/OromoWikipedia";
import JoinForm from "./landing/components/JoinForm";
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
import CreateEbook from "./pages/ebooks/CreateEbook";
import UpdateEbook from "./pages/ebooks/UpdateEbook";
import EbooksList from "./pages/ebooks/EbooksList";
import EbookManagementPage from "./pages/ebooks/EbookManagementPage";
import WikiProfileEdit from "./pages/wiki/users/WikiProfileEdit";
import ArticleDetails from "./pages/wiki/ArticleDetails";
import VandalismCheck from "./pages/wiki/VandalismCheck";
import JournalArticleDetail from "./landing/pages/JournalArticleDetail";
import JournalAuthPage from "./pages/journals/authors/JournalAuthPage";
import JournalAuthorLoginPage from "./pages/journals/authors/JournalAuthorLoginPage"; // New import
import ManuscriptContributePage from "./pages/journals/manuscriptions/pages/ManuscriptContributePage";
import AuthorManuscriptView from "./pages/manuscription/AuthorManuscriptView";
import UnderReviewAE from "./pages/manuscription/ae/UnderReviewAE";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public/Landing Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/join" element={<JoinForm />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/manuscript/:id" element={<JournalDetailPage />} />
        <Route path="/journal/article/:id" element={<JournalArticleDetail />} />
        <Route path="/journal/author" element={<JournalAuthPage />} />
        {/* New route for author login with redirect */}
        <Route path="/journal/author-login" element={<JournalAuthorLoginPage />} />
        {/* // manuscripts/contribute */}
        <Route path="/manuscripts/contribute" element={<ManuscriptContributePage />} />
        <Route path="/repository" element={<Repository />} />
        <Route path="/ebooks" element={<Ebooks />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/network" element={<Network />} />
        <Route path="/wikipedia" element={<OromoWikipedia />} />
        <Route path="/ora" element={<Landing />} />

        {/* Public Repository Routes */}
        <Route path="/repository/public" element={<PublicRepository />} />
        <Route path="/repository/:uuid" element={<PublicRepositoryDetail />} />
        <Route path="/public/login" element={<PublicLogin />} />
        <Route path="/register" element={<PublicRegister />} />
        <Route path="/public/dashboard" element={<PublicDashboard />} />
        
        {/* Public Layout with Nested Routes */}
        <Route path="/repository/public" element={<PublicLayout />}>
          <Route path="search" element={<PublicSearch />} />
        </Route>

        {/* Wiki Public Routes */}
        <Route path="/wiki/articles" element={<ArticleList />} />
        <Route path="/wiki/articles/:slug" element={<ArticleDetails />} />
        <Route path="/wiki/article/:slug" element={<WikiArticlePage />} />
        <Route path="/wiki/register" element={<RegisterPage />} />
        <Route path="/wiki/login" element={<WikiLoginPage />} />

        {/* Researcher Public Routes */}
        <Route path="/researcher/register" element={<ResearcherRegister />} />
        <Route path="/researcher" element={<PublicHome />} />
        <Route path="/researcher/login" element={<ResearcherLogin />} />
        <Route path="/researcher/profile/:userId" element={<ResearcherProfile />} />

        {/* Ebook Public Routes */}
        <Route path="/ebooks/author-registration" element={<EbookAuthorRegistrationForm />} />
        <Route path="/ebooks" element={<EbooksList />} />

        {/* Auth Route */}
        <Route path="/auth" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/roles" element={<ProtectedRoute><Roles /></ProtectedRoute>} />
        <Route path="/permissions" element={<ProtectedRoute><Permissions /></ProtectedRoute>} />
        <Route path="/role-permissions" element={<ProtectedRoute><RolePermissions /></ProtectedRoute>} />
        <Route path="/user-roles/:uuid" element={<ProtectedRoute><UserRoles /></ProtectedRoute>} />
        <Route path="/modules" element={<ProtectedRoute><Modules /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* Wiki Protected Routes */}
        <Route path="/wiki/dashboard" element={<ProtectedRoute><WikiDashboard /></ProtectedRoute>} />
        <Route path="/wiki/profile/edit" element={<ProtectedRoute><WikiProfileEdit /></ProtectedRoute>} />
        <Route path="/wiki/articles/new" element={<ProtectedRoute><CreateArticlePage /></ProtectedRoute>} />
        <Route path="/wiki/articles/edit/:id" element={<ProtectedRoute><ArticleEdit /></ProtectedRoute>} />
        <Route path="/wiki/articles/drafts" element={<ProtectedRoute><ArticleDraftList /></ProtectedRoute>} />
        <Route path="/wiki/categories" element={<ProtectedRoute><WikiCategoryList /></ProtectedRoute>} />
        <Route path="/wiki/categories/create" element={<ProtectedRoute><WikiCategoryForm /></ProtectedRoute>} />
        <Route path="/wiki/categories/edit/:id" element={<ProtectedRoute><WikiCategoryForm /></ProtectedRoute>} />
        <Route path="/wiki/media/upload" element={<ProtectedRoute><WikiMediaUploadPage /></ProtectedRoute>} />
        <Route path="/wiki/media" element={<ProtectedRoute><WikiMediaGalleryPage /></ProtectedRoute>} />
        <Route path="/wiki/vandalism/check" element={<ProtectedRoute><VandalismCheck /></ProtectedRoute>} />

        {/* Journal Protected Routes */}
        <Route path="/journal-dashboard" element={<ProtectedRoute><JournalDashboard /></ProtectedRoute>} />
        <Route path="/journal/author-dashboard" element={<ProtectedRoute><JournalAuthorDashboard /></ProtectedRoute>} />
        <Route path="/journal/users" element={<ProtectedRoute><JournalUserList /></ProtectedRoute>} />
        <Route path="/journal/list" element={<ProtectedRoute><JournalList /></ProtectedRoute>} />
        <Route path="/journal/add" element={<ProtectedRoute><JournalForm /></ProtectedRoute>} />
        <Route path="/journal/edit/:id" element={<ProtectedRoute><JournalEdit /></ProtectedRoute>} />
        <Route path="/journal/profile" element={<ProtectedRoute><JournalProfile /></ProtectedRoute>} />
        <Route path="/journal/workflow-stages" element={<ProtectedRoute><WorkflowStages /></ProtectedRoute>} />

        {/* Manuscript Protected Routes */}
        <Route path="/journal/manuscripts" element={<ProtectedRoute><ManuscriptList /></ProtectedRoute>} />
        <Route path="/manuscripts/:id" element={<ProtectedRoute><AuthorManuscriptView /></ProtectedRoute>} />
        <Route path="/manuscripts/create" element={<ProtectedRoute><ManuscriptCreate /></ProtectedRoute>} />
        <Route path="/manuscripts/edit/:id" element={<ProtectedRoute><ManuscriptEdit /></ProtectedRoute>} />
        <Route path="/journal/manuscripts/show/:id" element={<ProtectedRoute><ManuscriptShow /></ProtectedRoute>} />
        <Route path="/manuscript/draft-manuscript" element={<ProtectedRoute><DraftManuscripts /></ProtectedRoute>} />
        <Route path="/journal/manuscripts/revisions" element={<ProtectedRoute><RevisionRequiredManuscription /></ProtectedRoute>} />
        <Route path="/journal/manuscripts-status" element={<ProtectedRoute><ManuscriptStatuses /></ProtectedRoute>} />

        {/* EIC Protected Routes */}
        <Route path="/journal/eic/submissions" element={<ProtectedRoute><EICCompletedReviews /></ProtectedRoute>} />
        <Route path="/eic/decision/:id" element={<ProtectedRoute><EICMakeDecision /></ProtectedRoute>} />
        <Route path="/eic/manuscripts/:id" element={<ProtectedRoute><EICManuscriptDetails /></ProtectedRoute>} />
        <Route path="/eic/payment-orders" element={<ProtectedRoute><EICPaymentOrders /></ProtectedRoute>} />

        {/* AE Protected Routes */}
        <Route path="/manuscript/ae/assigned-manuscripts" element={<ProtectedRoute><ManuscriptListAE /></ProtectedRoute>} />
        <Route path="/manuscription/ae/screening" element={<ProtectedRoute><InitialScreeningListAE /></ProtectedRoute>} />
{/* //Under and show assigned refree and reassigned manuscripts  */}
        <Route path="/manuscript/ae/under-review" element={<ProtectedRoute><UnderReviewAE /></ProtectedRoute>} />
        {/* Reviewer Protected Routes */}
        <Route path="/journal/reviewer/assigned" element={<ProtectedRoute><AssignedReviews /></ProtectedRoute>} />
        <Route path="/reviewer/assigned/:id" element={<ProtectedRoute><AssignedReviewDetails /></ProtectedRoute>} />

        {/* Repository Protected Routes */}
        <Route path="/repository/admin/dashboard" element={<ProtectedRoute><RepositoryDashboard /></ProtectedRoute>} />
        <Route path="/repository/author/dashboard" element={<ProtectedRoute><RepositoryAuthorDashboard /></ProtectedRoute>} />
        <Route path="/repository/author/submit/list" element={<ProtectedRoute><RepositoryList /></ProtectedRoute>} />
        <Route path="/repository/create" element={<ProtectedRoute><RepositoryCreate /></ProtectedRoute>} />
        <Route path="/repository/show/:uuid" element={<ProtectedRoute><RepositoryShow /></ProtectedRoute>} />
        <Route path="/repository/author/show/:uuid" element={<ProtectedRoute><RepositoryShowAuthor /></ProtectedRoute>} />
        <Route path="/repository/edit/:uuid" element={<ProtectedRoute><RepositoryEdit /></ProtectedRoute>} />
        <Route path="/repository/search" element={<ProtectedRoute><RepositorySearch /></ProtectedRoute>} />
        <Route path="/repository/author/deposits/drafts" element={<ProtectedRoute><DraftRepository /></ProtectedRoute>} />
        <Route path="/repository/author/deposits/review" element={<ProtectedRoute><DepositsUnderReview /></ProtectedRoute>} />
        <Route path="/repository/author/deposits/returned" element={<ProtectedRoute><DepositsReturned /></ProtectedRoute>} />
        <Route path="/repository/author/deposits/approved" element={<ProtectedRoute><ApprovedDeposits /></ProtectedRoute>} />

        {/* Repository Curator Protected Routes */}
        <Route path="/repository/curator/dashboard" element={<ProtectedRoute><CuratorDashboard /></ProtectedRoute>} />
        <Route path="/repository/curator/queue/new" element={<ProtectedRoute><CuratorRepositoryList /></ProtectedRoute>} />
        <Route path="/repository/curator/review/:uuid" element={<ProtectedRoute><CuratorRepositoryReview /></ProtectedRoute>} />
        <Route path="/repository/curator/queue/in-progress" element={<ProtectedRoute><InProgress /></ProtectedRoute>} />
        <Route path="/repository/curator/queue/ready" element={<ProtectedRoute><ReadyToApprove /></ProtectedRoute>} />
        <Route path="/repository/curator/queue/returned" element={<ProtectedRoute><ReturnToRevision /></ProtectedRoute>} />
        <Route path="/repository/curator/tools" element={<ProtectedRoute><CuratorTool /></ProtectedRoute>} />
        <Route path="/repository/collections/author" element={<ProtectedRoute><CollectionsByAuthor /></ProtectedRoute>} />
        <Route path="/repository/collections/type" element={<ProtectedRoute><CollectionsByType /></ProtectedRoute>} />
        <Route path="/repository/reports/trends" element={<ProtectedRoute><RepositoryTrends /></ProtectedRoute>} />
        <Route path="/repository/reports/curator-performance" element={<ProtectedRoute><CuratorPerformanceReport /></ProtectedRoute>} />

        {/* Repository Reviewer Protected Routes */}
        <Route path="/repository/reviewer/dashboard" element={<ProtectedRoute><ReviewerDashboard /></ProtectedRoute>} />
        <Route path="/repository/reviewer/queue/new" element={<ProtectedRoute><ReviewerQueueNew /></ProtectedRoute>} />
        <Route path="/repository/reviewer/review/:uuid" element={<ProtectedRoute><ReviewerItemDetail /></ProtectedRoute>} />

        {/* Researcher Protected Routes */}
        <Route path="/researcher/dashboard" element={<ProtectedRoute><ResearcherDashboard /></ProtectedRoute>} />
        <Route path="/researcher/onboarding" element={<ProtectedRoute><ProfileOnboarding /></ProtectedRoute>} />
        <Route path="/researcher/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
        <Route path="/researcher/groups/create" element={<ProtectedRoute><GroupForm /></ProtectedRoute>} />
        <Route path="/researcher/groups/edit/:uuid" element={<ProtectedRoute><GroupForm /></ProtectedRoute>} />
        <Route path="/research-network/groups" element={<ProtectedRoute><AdminGroups /></ProtectedRoute>} />
        <Route path="/admin/groups/:uuid" element={<ProtectedRoute><AdminGroupDetails /></ProtectedRoute>} />

        {/* Ebook Protected Routes */}
        <Route path="/ebook/dashboard" element={<ProtectedRoute><EbookManagementPage /></ProtectedRoute>} />
        <Route path="/ebooks/create" element={<ProtectedRoute><CreateEbook /></ProtectedRoute>} />
        <Route path="/ebooks/edit/:id" element={<ProtectedRoute><UpdateEbook /></ProtectedRoute>} />

        {/* Finance Dashboard */}
        <Route path="/finance-dashboard" element={<ProtectedRoute><FinanceDashboard /></ProtectedRoute>} />

        {/* Other Dashboards */}
        <Route path="/book-dashboard" element={<ProtectedRoute><BookDashboard /></ProtectedRoute>} />
        <Route path="/library-dashboard" element={<ProtectedRoute><LibraryDashboard /></ProtectedRoute>} />
        <Route path="/wikipedia-dashboard" element={<ProtectedRoute><WikipediaDashboard /></ProtectedRoute>} />
        <Route path="/researcher-dashboard" element={<ProtectedRoute><ResearchersDashboard /></ProtectedRoute>} />
     
        {/* 404 Not Found - This should be the LAST route */}
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;