import pool from "../../config/db.js";

export const createManuscript = async (data) => {
  const result = await pool.query(
    `INSERT INTO ora_ebook_manuscripts
      (id, author_id, title, abstract, file_path, isbn, language, publication_year, status)
      VALUES (gen_random_uuid(), $1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
    [
      data.author_id,
      data.title,
      data.abstract,
      data.file_path,
      data.isbn,
      data.language,
      data.publication_year,
      data.status || "draft",
    ]
  );
  return result.rows[0];
};

export const getManuscripts = async () => {
  const result = await pool.query(
    `SELECT * FROM ora_ebook_manuscripts ORDER BY created_at DESC`
  );
  return result.rows;
};

export const getManuscriptById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM ora_ebook_manuscripts WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

export const updateManuscript = async (id, data) => {
  const result = await pool.query(
    `UPDATE ora_ebook_manuscripts SET
      title = $1,
      abstract = $2,
      isbn = $3,
      language = $4,
      publication_year = $5,
      status = $6,
      updated_at = NOW()
     WHERE id = $7
     RETURNING *`,
    [
      data.title,
      data.abstract,
      data.isbn,
      data.language,
      data.publication_year,
      data.status || "draft",
      id,
    ]
  );
  return result.rows[0];
};

export const deleteManuscript = async (id) => {
  await pool.query(`DELETE FROM ora_ebook_manuscripts WHERE id = $1`, [id]);
};

export const getManuscriptsByAuthor = async (author_id) => {
  const result = await pool.query(
    `SELECT * FROM ora_ebook_manuscripts WHERE author_id = $1 ORDER BY created_at DESC`,
    [author_id]
  );
  return result.rows;
};

export const getDraftManuscripts = async () => {
  const result = await pool.query(
    `SELECT * FROM ora_ebook_manuscripts WHERE status = 'draft' ORDER BY created_at DESC`
  );
  return result.rows;
};

export const publishDraftManuscript = async (id) => {
  const result = await pool.query(
    `UPDATE ora_ebook_manuscripts
     SET status = 'published', updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return result.rows[0];
};

export const getPublishedManuscripts = async () => {
  const result = await pool.query(
    `SELECT * FROM ora_ebook_manuscripts WHERE status = 'published' ORDER BY created_at DESC`
  );
  return result.rows;
};

export const searchManuscripts = async (query) => {
  const result = await pool.query(
    `SELECT * FROM ora_ebook_manuscripts
     WHERE title ILIKE $1
     ORDER BY created_at DESC`,
    [`%${query}%`]
  );
  return result.rows;
};

export const getRevisionManuscripts = async () => {
  const result = await pool.query(
    `SELECT * FROM ora_ebook_manuscripts
     WHERE status = 'revision_required'
     ORDER BY created_at DESC`
  );
  return result.rows;
};

export const getScreenedManuscripts = async () => {
  const result = await pool.query(
    `SELECT *
     FROM ora_ebook_manuscripts
     WHERE status = 'screened'
     ORDER BY updated_at DESC NULLS LAST, created_at DESC`
  );
  return result.rows;
};

export const screenManuscript = async ({
  id,
  editorId,
  relevance_score,
  scope_match,
  quality_score,
  comments,
  recommended_action,
}) => {
  const manuscriptResult = await pool.query(
    `SELECT * FROM ora_ebook_manuscripts WHERE id = $1`,
    [id]
  );

  if (manuscriptResult.rows.length === 0) {
    throw new Error("Manuscript not found");
  }

  const manuscript = manuscriptResult.rows[0];

  if (manuscript.status !== "submitted") {
    throw new Error("Only submitted manuscripts can be screened");
  }

  let dbRecommendation;
  let newStatus;

  if (recommended_action === "accept_for_peer_review") {
    dbRecommendation = "accept";
    newStatus = "screened";
  } else if (recommended_action === "return_for_corrections") {
    dbRecommendation = "minor_revision";
    newStatus = "revision_required";
  } else {
    throw new Error("Invalid recommended action");
  }

  await pool.query(
    `
    INSERT INTO screening_assessments
    (
      manuscript_id,
      editor_id,
      relevance_score,
      scope_match,
      quality_score,
      comments,
      recommended_action,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
    `,
    [
      id,
      editorId,
      relevance_score,
      scope_match,
      quality_score,
      comments,
      dbRecommendation,
    ]
  );

  const updatedResult = await pool.query(
    `
    UPDATE ora_ebook_manuscripts
    SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
    `,
    [newStatus, id]
  );

  return {
    success: true,
    message: "Screening completed successfully",
    manuscript: updatedResult.rows[0],
  };
};