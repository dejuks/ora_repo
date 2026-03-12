import { createCrudRouter } from "./createCrudRouter.js";
import { purchaseOrderController } from "../controllers/purchaseOrder.controller.js";

export default createCrudRouter(purchaseOrderController);
