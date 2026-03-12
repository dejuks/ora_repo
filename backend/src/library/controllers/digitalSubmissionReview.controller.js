import { createCrudController } from "./createCrudController.js";
import { DigitalSubmissionReviewModel } from "../models/digitalSubmissionReview.model.js";

export const digitalSubmissionReviewController = createCrudController(DigitalSubmissionReviewModel, "digital-submission-review");
