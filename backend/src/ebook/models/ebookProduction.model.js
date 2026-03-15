import { EbookBaseModel } from "./base.model.js";

export const EbookProductionModel = new EbookBaseModel({
  table: "ebook_production",
  primaryKey: "production_id",
  allowedColumns: [
    "submission_id", "handled_by", "pdf_ready", "epub_ready", "proof_sent_to_author", "author_proof_approved",
    "isbn", "doi", "repository_path", "quality_note", "started_at", "completed_at"
  ],
  searchableColumns: ["isbn", "doi", "repository_path", "quality_note"],
});
