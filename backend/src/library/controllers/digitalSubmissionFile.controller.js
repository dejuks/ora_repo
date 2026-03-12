import path from "path";
import { createCrudController } from "./createCrudController.js";
import { DigitalSubmissionFileModel } from "../models/digitalSubmissionFile.model.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { sha256File } from "../utils/fileChecksum.js";
import { badRequest } from "../utils/appError.js";

const crud = createCrudController(DigitalSubmissionFileModel, "digital-submission-file");

export const digitalSubmissionFileController = {
  ...crud,
  upload: asyncHandler(async (req, res) => {
    if (!req.file) throw badRequest('File is required');
    const submissionId = req.params.submissionId || req.body.submission_id;
    if (!submissionId) throw badRequest('submission_id is required');
    const row = await DigitalSubmissionFileModel.create({
      submission_id: submissionId,
      file_role: req.body.file_role || 'main',
      original_name: req.file.originalname,
      stored_name: req.file.filename,
      file_path: path.relative(process.cwd(), req.file.path).replace(/\\/g, '/'),
      mime_type: req.file.mimetype,
      file_size_bytes: req.file.size,
      checksum_sha256: await sha256File(req.file.path),
      uploaded_by: req.user?.uuid || null,
    });
    return res.status(201).json(row);
  }),
};
