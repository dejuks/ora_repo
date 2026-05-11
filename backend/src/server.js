import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import multer from "multer";

// =======================
// CORE ROUTES
// =======================
import authRoutes from "./routes/auth.routes.js";
import roleRoutes from "./routes/role.routes.js";
import userRoutes from "./routes/user.routes.js";
import permissionRoutes from "./routes/permission.routes.js";
import rolePermissionRoutes from "./routes/rolePermission.routes.js";
import userRoleRoutes from "./routes/userRole.routes.js";
import moduleRoutes from "./routes/module.routes.js";

// =======================
// REPOSITORY ROUTES
// =======================
import repositoryRoutes from "./repository/items/routes/repositoryItem.routes.js";
import publicRepositoryRoutes from "./repository/items/routes/publicRepository.routes.js";
import repositoryAuthorRoutes from "./repository/authors/routes/repositoryAuthor.routes.js";

// =======================
// JOURNAL ROUTES
// =======================
import journalRoutes from "./journals/routes/journalRoutes.js";
import journalSectionRoutes from "./journals/journalsection/routes/journalSection.routes.js";
import authorRoutes from "./journals/authors/routes/author.routes.js";
import userAccessRoutes from "./journals/authors/routes/userAccess.routes.js";
import journalUserRoutes from "./routes/journalUser.routes.js";

// =======================
// MANUSCRIPT ROUTES
// =======================
import manuscriptStatusRoutes from "./manuscription/status/routes/manuscriptStatus.routes.js";
import manuscriptRoutes from "./manuscription/routes/manuscript.routes.js";
import manuscriptAERoutes from "./manuscription/routes/associateEditor.routes.js";
import manuscriptReviewerRoutes from "./manuscription/routes/reviewer.routes.js";
import workflowStage from "./manuscription/workflowstages/routes/workflowStage.routes.js";
import ManuscriptFileRoute from "./manuscription/files/routes/files.routes.js";
import ManuscriptCategoryies from "./manuscription/routes/manuscript.category.routes.js";
import publicManuscription from "./manuscription/routes/public.manuscripts.routes.js";

// =======================
// PUBLICATION ROUTES
// =======================
import publicationRoutes from "./publication/routes/publication.routes.js";

// =======================
// WIKI ROUTES
// =======================
import wikiArticleRoutes from "./wiki/routes/articleRoutes.js";
import wikiCategoryRoutes from "./wiki/routes/categoryRoutes.js";
import wikiRoutes from "./wiki/routes/authRoutes.js";
import wikiMediaRoute from "./wiki/routes/mediaRoutes.js";

// =======================
// RESEARCHER ROUTES
// =======================
import adminRoutes from "./researcher/routes/admin.routes.js";
import researcherRoutes from "./researcher/routes/researcher.routes.js";
import groupResearcherRoutes from "./researcher/groups/routes/group.routes.js";
import connectionRoutes from "./researcher/routes/connection.route.js";

// =======================
// PUBLIC USER / EIC / PAYMENT
// =======================
import publicUserRoutes from "./publicUsers/routes/publicUser.routes.js";
import eicDecisionRoutes from "./eic/routes/eic.decision.routes.js";
import paymentRoutes from "./eic/routes/payment.routes.js";

// =======================
// LIBRARY / SETTINGS
// =======================
import libraryRoutes from "./library/routes/library.routes.js";
import systemSettingRoutes from "./routes/systemSetting.routes.js";
import publisherExternalRoutes from "./routes/publisher.routes.js";

// =======================
// ORA eBOOK ROUTES
// =======================
import dashboardEbookRoutes from "./ora_ebooks/routes/dashboard.routes.js";

import ebookRoutes from "./ebook/routes/ebook.routes.js";
import ebookPublicRoutes from "./ora_ebooks/routes/public.routes.js";
import ebookAuthorRoutes from "./ora_ebooks/routes/author.routes.js";
import ebookManuscriptRoutes from "./ora_ebooks/routes/manuscript.routes.js";
import editorRoutes from "./ora_ebooks/routes/editor-reviewer.routes.js";
import reviewerRoutes from "./ora_ebooks/routes/reviewer.routes.js";

import publicRoutes from "./ebook/routes/public.routes.js";
import EbooksPublicRoutes from "./ebook/routes/ebook.routes.js";

import ebookPublicationRoutes from "./ora_ebooks/routes/ebook.publication.routes.js";

// =======================
// CONFIG
// =======================
dotenv.config();

const app = express();

// =======================
// CORS
// =======================
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
    ],
  })
);

// =======================
// BODY PARSER
// =======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =======================
// STATIC FILES
// =======================
app.use(
  "/api/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

app.set("trust proxy", 1);

// ========================================================
// CORE API ROUTES
// ========================================================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/role-permissions", rolePermissionRoutes);
app.use("/api/user-roles", userRoleRoutes);
app.use("/api/modules", moduleRoutes);

// ========================================================
// JOURNAL ROUTES
// ========================================================
app.use("/api/journals", journalRoutes);
app.use("/api", journalSectionRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/user-access", userAccessRoutes);
app.use("/api/journal", journalUserRoutes);

// ========================================================
// MANUSCRIPT ROUTES
// ========================================================
app.use("/api/manuscript", ManuscriptCategoryies);
app.use("/api/manuscript-statuses", manuscriptStatusRoutes);
app.use("/api/manuscripts", manuscriptRoutes);
app.use("/api/public-manuscripts", publicManuscription);
app.use("/api/files", ManuscriptFileRoute);
app.use("/api/manuscriptions/ae", manuscriptAERoutes);
app.use("/api/manuscripts/reviewer", manuscriptReviewerRoutes);
app.use("/api/workflow-stages", workflowStage);

// ========================================================
// PUBLICATION ROUTES
// ========================================================
app.use("/api/publications", publicationRoutes);

// ========================================================
// REPOSITORY ROUTES
// ========================================================
app.use("/api/repository-items", repositoryRoutes);
app.use("/api/repository/public", publicRepositoryRoutes);
app.use("/api/repository-authors", repositoryAuthorRoutes);

// ========================================================
// WIKI ROUTES
// ========================================================
app.use("/api/wiki/articles", wikiArticleRoutes);
app.use("/api/wiki/categories", wikiCategoryRoutes);
app.use("/api/wiki/media", wikiMediaRoute);
app.use("/api/wiki", wikiRoutes);

// ========================================================
// RESEARCHER ROUTES
// ========================================================
app.use("/api/researcher", researcherRoutes);
app.use("/api/researcher/groups", groupResearcherRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/researcher/connections", connectionRoutes);

// ========================================================
// PUBLIC USER / EIC / PAYMENT
// ========================================================
app.use("/api/public-users", publicUserRoutes);
app.use("/api/eic", eicDecisionRoutes);
app.use("/api/payments", paymentRoutes);

// ========================================================
// SYSTEM / LIBRARY / PUBLISHER
// ========================================================
app.use("/api/system/settings", systemSettingRoutes);
app.use("/api/publisher", publisherExternalRoutes);
app.use("/api/library", libraryRoutes);

// ========================================================
// ORA eBOOK ROUTES
// ========================================================
app.use("/api/ebooks", ebookPublicationRoutes);

// Main ebook routes
app.use("/api/ebook", ebookRoutes);

// Public ebook publication routes

// Optional public routes
app.use("/api/ebook-public", ebookPublicRoutes);
app.use("/api/public", publicRoutes);

// Author routes
app.use("/api/ebook_authors", ebookAuthorRoutes);

// Manuscript routes
app.use("/api/ebook/manuscripts", ebookManuscriptRoutes);

// Reviewer routes
app.use("/api/oraebook/reviewer", reviewerRoutes);

// Editor routes
app.use("/api/oraebook/editor", editorRoutes);

// Dashboard routes
app.use("/api/oraebook/stats", dashboardEbookRoutes);

// REMOVE THIS WRONG DUPLICATE ROUTE
// app.use("/api/ebook/public/publications", EbooksPublicRoutes);

// ========================================================
// DEFAULT ROUTE
// ========================================================
app.get("/api/ora-researcher", (req, res) => {
  res.send("Researcher Network Platform API running...");
});

// ========================================================
// 404 HANDLER
// ========================================================
app.use((req, res) => {
  res.status(404).json({
    message: "API route not found.",
  });
});

// ========================================================
// GLOBAL ERROR HANDLER
// ========================================================
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
      message:
        "This record already exists or duplicates a unique value.",
    });
  }

  if (err?.code === "23503") {
    return res.status(400).json({
      message:
        "The requested record references data that does not exist.",
    });
  }

  if (err?.code === "23502") {
    return res.status(400).json({
      message: `Missing required field: ${
        err.column || "unknown"
      }.`,
    });
  }

  return res.status(err?.status || 500).json({
    message:
      err?.message || "Internal server error.",
  });
});

// ========================================================
// SERVER START
// ========================================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on http://localhost:${PORT}`
  );
});