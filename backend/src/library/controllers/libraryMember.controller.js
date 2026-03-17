import { createCrudController } from "./createCrudController.js";
import { LibraryMemberModel } from "../models/libraryMember.model.js";

export const libraryMemberController = createCrudController(LibraryMemberModel, "library-member");
