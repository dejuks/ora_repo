import { createCrudRouter } from "./createCrudRouter.js";
import { publisherController } from "../controllers/publisher.controller.js";

export default createCrudRouter(publisherController);
