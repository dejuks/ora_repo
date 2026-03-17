import { createCrudRouter } from "./createCrudRouter.js";
import { libraryBranchController } from "../controllers/libraryBranch.controller.js";

export default createCrudRouter(libraryBranchController);
