import { createCrudController } from "./createCrudController.js";
import { MaterialCopyModel } from "../models/materialCopy.model.js";

export const materialCopyController = createCrudController(MaterialCopyModel, "material-copy");
