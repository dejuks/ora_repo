import { createCrudRouter } from "./createCrudRouter.js";
import { libraryCategoryController } from "../controllers/libraryCategory.controller.js";

export default createCrudRouter(libraryCategoryController);
