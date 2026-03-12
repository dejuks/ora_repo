import { createCrudController } from "./createCrudController.js";
import { MemberStatusHistoryModel } from "../models/memberStatusHistory.model.js";

export const memberStatusHistoryController = createCrudController(MemberStatusHistoryModel, "member-status-history");
