import { createCrudRouter } from "./createCrudRouter.js";
import { finePaymentController } from "../controllers/finePayment.controller.js";

export default createCrudRouter(finePaymentController);
