import { createCrudRouter } from "./createCrudRouter.js";
import { digitalUsageLogController } from "../controllers/digitalUsageLog.controller.js";

export default createCrudRouter(digitalUsageLogController);
