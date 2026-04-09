import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import multer from "multer";

import authRoutes from "./routes/auth.routes.js";
import roleRoutes from "./routes/role.routes.js";

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
import publicManuscription from "./manuscription/routes/public.manuscripts.routes.js";

import userRoutes from "./routes/user.routes.js";
import permissionRoutes from "./routes/permission.routes.js";
import rolePermissionRoutes from "./routes/rolePermission.routes.js";
import userRoleRoutes from "./routes/userRole.routes.js";
import moduleRoutes from "./routes/module.routes.js";

import libraryRoutes from "./library/routes/library.routes.js";
import systemSettingRoutes from "./routes/systemSetting.routes.js";
import publisherExternalRoutes from "./routes/publisher.routes.js";
import ebookRoutes from "./ebook/routes/ebook.routes.js";
import ebookPublicRoutes from "./ebook/routes/ebookPublic.routes.js";
import repositoryAuthorRoutes from "./repository/authors/routes/repositoryAuthor.routes.js";

dotenv.config();

const app = express();

/* =======================
   CORS
======================= */
app.use(
  cors({
    origin: "http://localhost:3000",
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
   STATIC FILES
======================= */
app.use("/api/uploads", express.static(path.join(process.cwd(), "uploads")));
app.set("trust proxy", 1);

/* =======================
   API ROUTES
======================= */

// Auth & RBAC
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/role-permissions", rolePermissionRoutes);
app.use("/api/user-roles", userRoleRoutes);
app.use("/api/modules", moduleRoutes);

// Manuscripts
app.use("/api/manuscript", ManuscriptCategoryies);
app.use("/api/manuscript-statuses", manuscriptStatusRoutes);
app.use("/api/manuscripts", manuscriptRoutes);
app.use("/api/public-manuscripts", publicManuscription);
app.use("/api/files", ManuscriptFileRoute);
app.use("/api/manuscriptions/ae", manuscriptAERoutes);
app.use("/api/manuscripts/reviewer", manuscriptReviewerRoutes);
app.use("/api/workflow-stages", workflowStage);

// Journals
app.use("/api/journals", journalRoutes);
app.use("/api", journalSectionRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/user-access", userAccessRoutes);
app.use("/api/journal", journalUserRoutes);

// Publications
app.use("/api/publications", publicationRoutes);

// Repository
app.use("/api/repository-items", repositoryRoutes);
app.use("/api/repository/public", publicRepositoryRoutes);
app.use("/api/repository-authors", repositoryAuthorRoutes);

// Public users
app.use("/api/public-users", publicUserRoutes);

// Wiki
app.use("/api/wiki/articles", wikiArticleRoutes);
app.use("/api/wiki/categories", wikiCategoryRoutes);
app.use("/api/wiki/media", wikiMediaRoute);
app.use("/api/wiki", wikiRoutes);

// Researcher
app.use("/api/researcher", researcherRoutes);
app.use("/api/researcher/groups", groupResearcherRoutes);
app.use("/api/researcher/connections", connectionRoutes);
app.use("/api/admin", adminRoutes);

// EIC / Payments
app.use("/api/eic", eicDecisionRoutes);
app.use("/api/payments", paymentRoutes);

// Settings / Publisher
app.use("/api/system/settings", systemSettingRoutes);
app.use("/api/publisher", publisherExternalRoutes);

// Ebook
app.use("/api/ebook", ebookRoutes);
app.use("/api/ebook-public", ebookPublicRoutes);

// Library
// Only this mount should remain for all physical and digital library routes
app.use("/api/library", libraryRoutes);

/* =======================
   DEFAULT ROUTE
======================= */
app.get("/api/ora-researcher", (req, res) => {
  res.send("Researcher Network Platform API running...");
});

/* =======================
   ERROR HANDLING
======================= */

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "API route not found." });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);

  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Uploaded file is too large."
        : err.message || "File upload failed.";

    return res.status(400).json({
      message,
      code: err.code,
    });
  }

  if (err?.message === "Invalid file type") {
    return res.status(400).json({
      message:
        "Invalid file type. Please upload PDF, EPUB, DOC, DOCX, ZIP, TXT, PNG, or JPG files.",
    });
  }

  if (err?.code === "23505") {
    return res.status(409).json({
      message: "This record already exists or duplicates a unique value.",
    });
  }

  if (err?.code === "23503") {
    return res.status(400).json({
      message: "The requested record references data that does not exist.",
    });
  }

  if (err?.code === "23502") {
    return res.status(400).json({
      message: `Missing required field: ${err.column || "unknown"}.`,
    });
  }

  return res.status(err?.status || 500).json({
    message: err?.message || "Internal server error.",
  });
});

/* =======================
   SERVER START
======================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});