import { createCrudController } from "./createCrudController.js";
import { FinePaymentModel } from "../models/finePayment.model.js";

export const finePaymentController = createCrudController(FinePaymentModel, "fine-payment");
