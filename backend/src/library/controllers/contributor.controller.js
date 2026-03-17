import { createCrudController } from "./createCrudController.js";
import { ContributorModel } from "../models/contributor.model.js";

export const contributorController = createCrudController(ContributorModel, "contributor");
