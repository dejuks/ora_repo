import { createCrudRouter } from "./createCrudRouter.js";
import { inventoryAuditItemController } from "../controllers/inventoryAuditItem.controller.js";

export default createCrudRouter(inventoryAuditItemController);
