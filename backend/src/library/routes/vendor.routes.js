import { createCrudRouter } from "./createCrudRouter.js";
import { vendorController } from "../controllers/vendor.controller.js";

export default createCrudRouter(vendorController);
