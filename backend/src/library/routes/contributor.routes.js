import { createCrudRouter } from "./createCrudRouter.js";
import { contributorController } from "../controllers/contributor.controller.js";

export default createCrudRouter(contributorController);
