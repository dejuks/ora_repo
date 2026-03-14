import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import roleRoutes from "./routes/role.routes.js";
import permissionRoutes from "./routes/permission.routes.js";
import rolePermissionRoutes from "./routes/rolePermission.routes.js";
import userRoleRoutes from "./routes/userRole.routes.js";
import moduleRoutes from "./routes/module.routes.js";

import repositoryRoutes from "./repository/items/routes/repositoryItem.routes.js";
import publicRepositoryRoutes from "./repository/items/routes/publicRepository.routes.js";

import journalRoutes from "./journals/routes/journalRoutes.js";
import journalSectionRoutes from "./journals/journalsection/routes/journalSection.routes.js";
import authorRoutes from "./journals/authors/routes/author.routes.js";
import userAccessRoutes from "./journals/authors/routes/userAccess.routes.js";
import journalUserRoutes from "./routes/journalUser.routes.js";

import manuscriptStatusRoutes from "./manuscription/status/routes/manuscriptStatus.routes.js";
import manuscriptRoutes from "./manuscription/routes/manuscript.routes.js";
import manuscriptAERoutes from "./manuscription/routes/associateEditor.routes.js";
import manuscriptReviewerRoutes from "./manuscription/routes/reviewer.routes.js";
import workflowStage from "./manuscription/workflowstages/routes/workflowStage.routes.js";
import ManuscriptFileRoute from "./manuscription/files/routes/files.routes.js";
import ManuscriptCategoryies from "./manuscription/routes/manuscript.category.routes.js";

import publicationRoutes from "./publication/routes/publication.routes.js";

import wikiArticleRoutes from "./wiki/routes/articleRoutes.js";
import wikiCategoryRoutes from "./wiki/routes/categoryRoutes.js";
import wikiRoutes from "./wiki/routes/authRoutes.js";
import wikiMediaRoute from "./wiki/routes/mediaRoutes.js";

import adminRoutes from "./researcher/routes/admin.routes.js";
import researcherRoutes from "./researcher/routes/researcher.routes.js";
import groupResearcherRoutes from "./researcher/groups/routes/group.routes.js";
import connectionRoutes from "./researcher/routes/connection.route.js";

import publicUserRoutes from "./publicUsers/routes/publicUser.routes.js";
import eicDecisionRoutes from "./eic/routes/eic.decision.routes.js";
import paymentRoutes from "./eic/routes/payment.routes.js";
import ebookAuthorRoutes from "./ebooks/routes/ebookAuthorRoutes.js";

import publicManuscriptRoutes from "./manuscription/routes/public.manuscripts.routes.js";


dotenv.config();

const app = express();

/* =======================
   CORS
======================= */
app.use(
  cors({
    origin: true, // ⚠️ better for production behind nginx
    credentials: true,
  })
);

/* =======================
   BODY PARSER
======================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/manuscripts", publicManuscriptRoutes);
app.use("/api/manuscripts", manuscriptRoutes);
/* =======================
   STATIC FILES
======================= */
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

app.set("trust proxy", 1);

/* =======================
   API ROUTES
======================= */


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/role-permissions", rolePermissionRoutes);
app.use("/api/user-roles", userRoleRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/manuscript", ManuscriptCategoryies);

app.use("/api/journals", journalRoutes);
app.use("/api", journalSectionRoutes);

app.use("/api/manuscript-statuses", manuscriptStatusRoutes);
app.use("/api/files", ManuscriptFileRoute);
app.use("/api/manuscriptions/ae", manuscriptAERoutes);
app.use("/api/manuscripts/reviewer", manuscriptReviewerRoutes);
app.use("/api/workflow-stages", workflowStage);

app.use("/api/publications", publicationRoutes);

app.use("/api/repository-items", repositoryRoutes);
app.use("/api/repository/public", publicRepositoryRoutes);

app.use("/api/public-users", publicUserRoutes);

app.use("/api/wiki/articles", wikiArticleRoutes);
app.use("/api/wiki/categories", wikiCategoryRoutes);
app.use("/api/wiki/media", wikiMediaRoute);
app.use("/api/wiki", wikiRoutes);

app.use("/api/ebooks", ebookAuthorRoutes);

app.use("/api/researcher", researcherRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/researcher/groups", groupResearcherRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/researcher/connections", connectionRoutes);

app.use("/api/user-access", userAccessRoutes);
app.use("/api/journal", journalUserRoutes);

app.use("/api/eic", eicDecisionRoutes);
app.use("/api/payments", paymentRoutes);

/* =======================
   DEFAULT ROUTE
======================= */
app.get("/api/ora-researcher", (req, res) => {
  res.send("Researcher Network Platform API running...");
});

/* =======================
   SERVER START
======================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});