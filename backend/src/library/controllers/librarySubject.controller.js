import { createCrudController } from "./createCrudController.js";
import { LibrarySubjectModel } from "../models/librarySubject.model.js";

export const librarySubjectController = createCrudController(LibrarySubjectModel, "library-subject");
