import { createCrudRouter } from "./createCrudRouter.js";
import { materialTypeController } from "../controllers/materialType.controller.js";

export default createCrudRouter(materialTypeController);
