import { createCrudRouter } from "./createCrudRouter.js";
import { loanRenewalController } from "../controllers/loanRenewal.controller.js";

export default createCrudRouter(loanRenewalController);
