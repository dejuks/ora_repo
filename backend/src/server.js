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
import libraryRoutes from "./library/routes/library.routes.js";
import systemSettingRoutes from "./routes/systemSetting.routes.js";
import publisherExternalRoutes from "./routes/publisher.routes.js";
import ebookRoutes from "./ebook/routes/ebook.routes.js";
import ebookPublicRoutes from "./ebook/routes/ebookPublic.routes.js";

dotenv.config();

const app = express();
 
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  }),
);

/* =======================
   BODY PARSER
======================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =======================
   STATIC FILES (IMPORTANT)
======================= */
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

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
app.use("/api/system/settings", systemSettingRoutes);
app.use("/api/publisher", publisherExternalRoutes);
app.use("/api/ebook", ebookRoutes);
app.use("/api/ebook-public", ebookPublicRoutes);

/* LIBRARY */
app.use("/api/library", libraryRoutes);

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