import { createCrudController } from "./createCrudController.js";
import { LibraryLocationModel } from "../models/libraryLocation.model.js";

export const libraryLocationController = createCrudController(LibraryLocationModel, "library-location");
