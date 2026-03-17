import { createCrudRouter } from "./createCrudRouter.js";
import { digitalAccessRuleController } from "../controllers/digitalAccessRule.controller.js";

export default createCrudRouter(digitalAccessRuleController);
