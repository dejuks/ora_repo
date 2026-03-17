import { createCrudController } from "./createCrudController.js";
import { DigitalAccessRuleModel } from "../models/digitalAccessRule.model.js";

export const digitalAccessRuleController = createCrudController(DigitalAccessRuleModel, "digital-access-rule");
