import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path"; // ✅ REQUIRED

import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import roleRoutes from "./routes/role.routes.js";
import permissionRoutes from "./routes/permission.routes.js";
import rolePermissionRoutes from "./routes/rolePermission.routes.js";
import userRoleRoutes from "./routes/userRole.routes.js";
import moduleRoutes from "./routes/module.routes.js";
import repositoryRoutes from "./repository/items/routes/repositoryItem.routes.js";
import journalRoutes from "./journals/routes/journalRoutes.js";
import journalSectionRoutes from "./journals/journalsection/routes/journalSection.routes.js";

import manuscriptStatusRoutes from "./manuscription/status/routes/manuscriptStatus.routes.js";
import manuscriptRoutes from "./manuscription/routes/manuscript.routes.js";
import publicRepositoryRoutes from "./repository/items/routes/publicRepository.routes.js";

import publicUserRoutes from "./publicUsers/routes/publicUser.routes.js";

import wikiArticleRoutes from "./wiki/routes/articleRoutes.js";
import wikiCategoryRoutes from "./wiki/routes/categoryRoutes.js";
import manuscriptAERoutes from "./manuscription/routes/associateEditor.routes.js";
import manuscriptReviewerRoutes from "./manuscription/routes/reviewer.routes.js";

import adminRoutes from "./researcher/routes/admin.routes.js";
import researcherRoutes from "./researcher/routes/researcher.routes.js";

import groupResearcherRoutes from "./researcher/groups/routes/group.routes.js";
import connectionRoutes from "./researcher/routes/connection.route.js";
import authorRoutes from "./journals/authors/routes/author.routes.js"; // <-- import routes, not controller
// import userAccessRoutes from "./journals/authors/routes/userAccess.routes";
import userAccessRoutes from "./journals/authors/routes/userAccess.routes.js";
import journalUserRoutes from "./routes/journalUser.routes.js";
import workflowStage from "./manuscription/workflowstages/routes/workflowStage.routes.js";
import ManuscriptCategoryies from "./manuscriptCategories/routes/routes.categories.js";

import ManuscriptFileRoute from "./manuscription/files/routes/files.routes.js";

import eicDecisionRoutes from "./eic/routes/eic.decision.routes.js";
import wikiRoutes from "./wiki/routes/authRoutes.js";

import paymentRoutes from './eic/routes/payment.routes.js';
import publicationRoutes from "./publication/routes/publication.routes.js"; // Add this import
import wikiMediaRoute from "./wiki/routes/mediaRoutes.js";

dotenv.config();

const app = express();

/* =======================
   CORS (ONLY ONCE)
======================= */
app.use(
  cors({
    origin: "http://localhost:3000", // React app
    credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

/* =======================
   BODY PARSER
======================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =======================
   STATIC FILES (IMPORTANT)
======================= */
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

/*
  Now this works:
  http://localhost:5000/uploads/manuscripts/1769311484305-224593152.pdf
*/

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

app.use("/api/categories",ManuscriptCategoryies);
app.use("/api/journals", journalRoutes);
app.use("/api", journalSectionRoutes);

app.use("/api/manuscript-statuses", manuscriptStatusRoutes);
app.use("/api/manuscripts", manuscriptRoutes);
app.use("/api/files",ManuscriptFileRoute);
app.use("/api/manuscriptions/ae", manuscriptAERoutes);
app.use("/api/manuscripts/reviewer", manuscriptReviewerRoutes);

app.use("/api/publications", publicationRoutes); // Add this line


app.use("/api/repository-items", repositoryRoutes);
app.use("/uploads", express.static("uploads"));

app.use("/api/repository/public", publicRepositoryRoutes);

app.use("/api/public-users", publicUserRoutes);


// Wiki routes

app.use("/api/wiki/articles", wikiArticleRoutes);
app.use("/api/wiki/categories", wikiCategoryRoutes);
app.use("/api/wiki/media", wikiMediaRoute);




//Routes research network

// --- API Routes ---
app.use("/api/researcher", researcherRoutes);

app.use("/api/authors", authorRoutes);

app.use("/api/researcher/groups", groupResearcherRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/researcher/connections", connectionRoutes);
// app.use("/api/manuscripts/reviewer", reviewerRoutes);

app.use("/api/user-access", userAccessRoutes);
app.use("/api/journal", journalUserRoutes);
app.use("/api/workflow-stages",workflowStage);
app.use("/api/eic", eicDecisionRoutes);

app.use('/api/wiki', wikiRoutes);



app.use('/api/payments', paymentRoutes);
// Default route
app.get("/api/ora-researcher", (req, res) => {
  res.send("Researcher Network Platform API running...");
});
/* =======================
   SERVER START
======================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
