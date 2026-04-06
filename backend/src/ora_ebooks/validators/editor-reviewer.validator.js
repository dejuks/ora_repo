export function validateAssignReviewers(req, res, next) {
  const { reviewer_ids, due_date, invitation_note } = req.body || {};

  if (!Array.isArray(reviewer_ids) || reviewer_ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: "reviewer_ids must be a non-empty array",
    });
  }

  const invalid = reviewer_ids.find(
    (id) => typeof id !== "string" || !id.trim()
  );

  if (invalid) {
    return res.status(400).json({
      success: false,
      message: "Each reviewer_id must be a valid string",
    });
  }

  if (due_date && Number.isNaN(Date.parse(due_date))) {
    return res.status(400).json({
      success: false,
      message: "due_date must be a valid date",
    });
  }

  if (
    invitation_note !== undefined &&
    invitation_note !== null &&
    typeof invitation_note !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "invitation_note must be a string",
    });
  }

  next();
}

export function validateUpdateAssignment(req, res, next) {
  const { status, due_date, invitation_note } = req.body || {};
  const allowed = ["assigned", "accepted", "declined", "submitted"];

  if (status && !allowed.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `status must be one of: ${allowed.join(", ")}`,
    });
  }

  if (due_date && Number.isNaN(Date.parse(due_date))) {
    return res.status(400).json({
      success: false,
      message: "due_date must be a valid date",
    });
  }

  if (
    invitation_note !== undefined &&
    invitation_note !== null &&
    typeof invitation_note !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "invitation_note must be a string",
    });
  }

  next();
}