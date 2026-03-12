import { createCrudController } from "./createCrudController.js";
import { MaterialTypeModel } from "../models/materialType.model.js";

export const materialTypeController = createCrudController(MaterialTypeModel, "material-type");
