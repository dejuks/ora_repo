import { createCrudController } from "./createCrudController.js";
import { CatalogMaterialModel } from "../models/catalogMaterial.model.js";

export const catalogMaterialController = createCrudController(CatalogMaterialModel, "catalog-material");
