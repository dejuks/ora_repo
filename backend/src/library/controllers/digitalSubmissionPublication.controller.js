import { createCrudController } from "./createCrudController.js";
import { DigitalSubmissionPublicationModel } from "../models/digitalSubmissionPublication.model.js";

export const digitalSubmissionPublicationController = createCrudController(DigitalSubmissionPublicationModel, "digital-submission-publication");
