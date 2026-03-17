import { createCrudController } from "./createCrudController.js";
import { CatalogMaterialSubjectModel } from "../models/catalogMaterialSubject.model.js";

export const catalogMaterialSubjectController = createCrudController(CatalogMaterialSubjectModel, "catalog-material-subject");
