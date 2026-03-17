import { createCrudRouter } from "./createCrudRouter.js";
import { memberTypeController } from "../controllers/memberType.controller.js";

export default createCrudRouter(memberTypeController);
