import { createCrudRouter } from "./createCrudRouter.js";
import { languageController } from "../controllers/language.controller.js";

export default createCrudRouter(languageController);
