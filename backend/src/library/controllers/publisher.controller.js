import { createCrudController } from "./createCrudController.js";
import { PublisherModel } from "../models/publisher.model.js";

export const publisherController = createCrudController(PublisherModel, "publisher");
