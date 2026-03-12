import { createCrudRouter } from "./createCrudRouter.js";
import { memberStatusHistoryController } from "../controllers/memberStatusHistory.controller.js";

export default createCrudRouter(memberStatusHistoryController);
