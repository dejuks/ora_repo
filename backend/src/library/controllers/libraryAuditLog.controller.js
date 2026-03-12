import { createCrudController } from "./createCrudController.js";
import { LibraryAuditLogModel } from "../models/libraryAuditLog.model.js";

export const libraryAuditLogController = createCrudController(LibraryAuditLogModel, "library-audit-log");
