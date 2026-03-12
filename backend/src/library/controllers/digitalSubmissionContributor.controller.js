import { createCrudController } from "./createCrudController.js";
import { DigitalSubmissionContributorModel } from "../models/digitalSubmissionContributor.model.js";

export const digitalSubmissionContributorController = createCrudController(DigitalSubmissionContributorModel, "digital-submission-contributor");
