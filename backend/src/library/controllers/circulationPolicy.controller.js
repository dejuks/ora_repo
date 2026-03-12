import { createCrudController } from "./createCrudController.js";
import { CirculationPolicyModel } from "../models/circulationPolicy.model.js";

export const circulationPolicyController = createCrudController(CirculationPolicyModel, "circulation-policy");
