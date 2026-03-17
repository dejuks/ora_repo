import { EbookBaseModel } from "./base.model.js";

export const EbookPublicationModel = new EbookBaseModel({
  table: "ebook_publications",
  primaryKey: "publication_id",
  allowedColumns: [
    "submission_id", "production_id", "published_by", "slug", "access_level", "embargo_until", "license_name",
    "landing_page_title", "cover_image_path", "published_at", "is_public"
  ],
  searchableColumns: ["slug", "access_level", "license_name", "landing_page_title"],
});
