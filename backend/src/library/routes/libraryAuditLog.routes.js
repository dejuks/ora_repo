import { createCrudRouter } from "./createCrudRouter.js";
import { libraryAuditLogController } from "../controllers/libraryAuditLog.controller.js";

export default createCrudRouter(libraryAuditLogController);
