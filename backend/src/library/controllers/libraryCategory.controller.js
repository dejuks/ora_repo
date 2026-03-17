import { createCrudController } from "./createCrudController.js";
import { LibraryCategoryModel } from "../models/libraryCategory.model.js";

export const libraryCategoryController = createCrudController(LibraryCategoryModel, "library-category");
