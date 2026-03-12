import { createCrudController } from "./createCrudController.js";
import { CatalogMaterialContributorModel } from "../models/catalogMaterialContributor.model.js";

export const catalogMaterialContributorController = createCrudController(CatalogMaterialContributorModel, "catalog-material-contributor");
