import { createCrudController } from "./createCrudController.js";
import { LibraryBranchModel } from "../models/libraryBranch.model.js";

export const libraryBranchController = createCrudController(LibraryBranchModel, "library-branch");
