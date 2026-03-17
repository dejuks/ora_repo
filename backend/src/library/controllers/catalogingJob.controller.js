import { createCrudController } from "./createCrudController.js";
import { CatalogingJobModel } from "../models/catalogingJob.model.js";

export const catalogingJobController = createCrudController(CatalogingJobModel, "cataloging-job");
