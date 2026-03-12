import { createCrudController } from "./createCrudController.js";
import { LanguageModel } from "../models/language.model.js";

export const languageController = createCrudController(LanguageModel, "language");
