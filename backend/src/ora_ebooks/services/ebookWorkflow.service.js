import * as ebookModel from "../models/ebook.model.js";

export const ebookWorkflowService = {
  async publicCatalog(query) {
    return await ebookModel.getPublications(query);
  },

  async logPublicAccess(publicationId, data) {
    return await ebookModel.insertLog(publicationId, data);
  },
};