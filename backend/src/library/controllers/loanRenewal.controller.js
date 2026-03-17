import { createCrudController } from "./createCrudController.js";
import { LoanRenewalModel } from "../models/loanRenewal.model.js";

export const loanRenewalController = createCrudController(LoanRenewalModel, "loan-renewal");
