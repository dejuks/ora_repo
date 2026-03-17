import { createCrudRouter } from "./createCrudRouter.js";
import { catalogingJobController } from "../controllers/catalogingJob.controller.js";

export default createCrudRouter(catalogingJobController);
