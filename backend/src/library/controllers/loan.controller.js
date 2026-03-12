import { createCrudController } from "./createCrudController.js";
import { LoanModel } from "../models/loan.model.js";
import { loanService } from "../services/loan.service.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const crud = createCrudController(LoanModel, "loan");

export const loanController = {
  ...crud,
  borrow: asyncHandler(async (req, res) => {
    const loan = await loanService.borrow({ ...req.body, issued_by: req.body.issued_by || req.user?.uuid || null }, { ipAddress: req.ip, userAgent: req.get('user-agent') });
    return res.status(201).json(loan);
  }),
  returnLoan: asyncHandler(async (req, res) => {
    const result = await loanService.returnLoan(req.params.id, { ...req.body, returned_to: req.body.returned_to || req.user?.uuid || null }, { ipAddress: req.ip, userAgent: req.get('user-agent') });
    return res.json(result);
  }),
  renew: asyncHandler(async (req, res) => {
    const result = await loanService.renewLoan(req.params.id, { ...req.body, renewed_by: req.body.renewed_by || req.user?.uuid || null }, { ipAddress: req.ip, userAgent: req.get('user-agent') });
    return res.json(result);
  }),
};
