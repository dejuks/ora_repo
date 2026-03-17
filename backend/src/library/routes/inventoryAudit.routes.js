import { createCrudRouter } from "./createCrudRouter.js";
import { inventoryAuditController } from "../controllers/inventoryAudit.controller.js";

export default createCrudRouter(inventoryAuditController);
