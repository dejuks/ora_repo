import { createCrudController } from "./createCrudController.js";
import { FineWaiverModel } from "../models/fineWaiver.model.js";

export const fineWaiverController = createCrudController(FineWaiverModel, "fine-waiver");
