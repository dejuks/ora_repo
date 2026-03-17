import { createCrudRouter } from "./createCrudRouter.js";
import { catalogMaterialController } from "../controllers/catalogMaterial.controller.js";

export default createCrudRouter(catalogMaterialController);
