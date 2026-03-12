import { createCrudRouter } from "./createCrudRouter.js";
import { acquisitionRequestController } from "../controllers/acquisitionRequest.controller.js";

export default createCrudRouter(acquisitionRequestController);
