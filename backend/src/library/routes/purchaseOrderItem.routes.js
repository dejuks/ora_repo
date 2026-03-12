import { createCrudRouter } from "./createCrudRouter.js";
import { purchaseOrderItemController } from "../controllers/purchaseOrderItem.controller.js";

export default createCrudRouter(purchaseOrderItemController);
