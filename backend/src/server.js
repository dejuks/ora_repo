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

app.use("/api/journals", journalRoutes);
app.use("/api", journalSectionRoutes);

app.use("/api/manuscript-statuses", manuscriptStatusRoutes);
app.use("/api/manuscripts", manuscriptRoutes);
app.use("/api/repository-items", repositoryRoutes);
app.use("/uploads", express.static("uploads"));

app.use("/api/repository/public", publicRepositoryRoutes);

app.use("/api/public-users", publicUserRoutes);
/* =======================
   SERVER START
======================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
