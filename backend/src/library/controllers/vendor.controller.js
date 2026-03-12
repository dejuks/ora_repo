import { createCrudController } from "./createCrudController.js";
import { VendorModel } from "../models/vendor.model.js";

export const vendorController = createCrudController(VendorModel, "vendor");
