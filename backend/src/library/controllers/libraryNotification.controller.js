import { createCrudController } from "./createCrudController.js";
import { LibraryNotificationModel } from "../models/libraryNotification.model.js";

export const libraryNotificationController = createCrudController(LibraryNotificationModel, "library-notification");
