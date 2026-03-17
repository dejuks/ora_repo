import { createCrudController } from "./createCrudController.js";
import { MemberTypeModel } from "../models/memberType.model.js";

export const memberTypeController = createCrudController(MemberTypeModel, "member-type");
