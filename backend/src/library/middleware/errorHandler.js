import { AppError } from "../utils/appError.js";

export const libraryErrorHandler = (err, req, res, next) => {
  console.error("[library]", err);
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }
  if (err?.name === "MulterError") {
    return res.status(400).json({ message: err.message });
  }
  if (err?.errors) {
    return res.status(400).json({ message: "Validation failed", details: err.errors });
  }
  return res.status(500).json({ message: err.message || "Library module error" });
};
