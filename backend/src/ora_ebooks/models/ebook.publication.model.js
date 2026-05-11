import db from "../../config/db.js";

// ================= PUBLIC CATALOG =================
export async function listPublicCatalog({
  search = "",
  access_level,
  limit = 50,
}) {
  const values = [];

  let where = `
    WHERE em.status = 'published'
    AND em.payment_status = 'paid'
  `;

  // SEARCH
  if (search) {
    values.push(`%${search}%`);

    where += `
      AND (
        em.title ILIKE $${values.length}
        OR em.abstract ILIKE $${values.length}
      )
    `;
  }

  // ACCESS LEVEL
  if (access_level) {
    values.push(access_level);

    where += `
      AND em.access_level = $${values.length}
    `;
  }

  values.push(limit);

  const query = `
    SELECT
      em.id,
      em.title,
      em.abstract,
      em.slug,
      em.language,
      em.publication_year,
      em.status,
      em.payment_status,
      em.access_level,
      em.created_at,
      em.updated_at,
      em.published_at,

      u.full_name AS author_name

    FROM ora_ebook_manuscripts em

    LEFT JOIN users u
      ON u.uuid = em.author_id

    ${where}

    ORDER BY em.created_at DESC

    LIMIT $${values.length}
  `;

  const { rows } = await db.query(query, values);

  return {
    rows,
  };
}

//makePublished
export async function makePublished(id) {
  const query = `
    UPDATE ora_ebook_manuscripts
    SET status = 'published',
        published_at = NOW()
    WHERE id = $1
    RETURNING *
  `;

  const { rows } = await db.query(query, [id]);

  return rows[0];
}
                
// ================= MANAGEMENT PUBLICATIONS =================

export async function listPublications({
  search = "",
  limit = 50,
}) {
  const values = [];

  let where = `
    WHERE era.payment_status = 'paid'
  `;

  // ================= SEARCH =================
  if (search) {
    values.push(`%${search}%`);

    where += `
      AND (
        em.title ILIKE $${values.length}
        OR em.abstract ILIKE $${values.length}
        OR em.isbn ILIKE $${values.length}
      )
    `;
  }

  // ================= LIMIT =================
  values.push(limit);

  const query = `
    SELECT
      em.id,
      em.author_id,
      em.title,
      em.abstract,
      em.file_path,
      em.isbn,
      em.language,
      em.publication_year,
      em.status,
      em.created_at,
      em.updated_at,

      era.assignment_id,
      era.payment_status,
      era.payment_method,
      era.completed_at,
      era.recommendation,

      u.full_name AS author_name

    FROM ora_ebook_manuscripts em

    LEFT JOIN ebook_review_assignments era
      ON era.submission_id = em.id

    LEFT JOIN users u
      ON u.uuid = em.author_id

    ${where}

    ORDER BY em.created_at DESC

    LIMIT $${values.length}
  `;

  const { rows } = await db.query(query, values);

  return {
    rows,
  };
}

// ================= SEARCH SUGGESTIONS =================
export async function getPublicSearchSuggestions({
  q = "",
  limit = 6,
}) {
  const query = `
    SELECT
      em.slug,
      em.title,
      em.access_level,
      u.full_name AS author_name

    FROM ora_ebook_manuscripts em

    LEFT JOIN users u
      ON u.uuid = em.author_id

    WHERE em.status = 'published'
    AND em.payment_status = 'paid'
    AND (
      em.title ILIKE $1
      OR em.abstract ILIKE $1
    )

    ORDER BY em.created_at DESC

    LIMIT $2
  `;

  const { rows } = await db.query(query, [
    `%${q}%`,
    limit,
  ]);

  return rows;
}

// ================= DETAIL =================
export async function getPublicPublicationController(
  req,
  res
) {
  try {
    const publication =
      await getPublicPublication(
        req.params.slug
      );

    if (!publication) {
      return res.status(404).json({
        message:
          "Publication not found",
      });
    }

    res.json(publication);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to load publication",
    });
  }
}
export const getPublicCitationController = async (req, res) => {
  try {
    const { id } = req.params;

    const citation = await getCitationById(id);

    if (!citation) {
      return res.status(404).json({ message: "Citation not found" });
    }

    res.json(citation);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
  //getPublicationById
 export async function getPublicPublication(id) {
  const query = `
    SELECT
      em.id,
      em.title,
      em.abstract,
      em.language,
      em.publication_year,
      em.status,
      ra.payment_status,
      em.created_at,
      em.updated_at,
      em.published_at,

      u.full_name AS author_name,

      -- review info (optional but useful)
      ra.status AS review_status,
      ra.completed_at AS review_completed_at

    FROM ora_ebook_manuscripts em

    LEFT JOIN users u
      ON u.uuid = em.author_id

    -- join latest review assignment (important)
    LEFT JOIN ebook_review_assignments ra
      ON ra.manuscript_id = em.id
      AND ra.status = 'completed'

    WHERE em.id = $1
      AND em.status = 'published'
      AND em.payment_status = 'paid'
      AND ra.status = 'completed'
  `;

  const { rows } = await db.query(query, [id]);

  return rows[0];
}

export async function getCitationById(id) {
  const query = `
    SELECT
      citation

    FROM ora_ebook_manuscripts

    WHERE id = $1
  `;

  const { rows } = await db.query(query, [id]);

  return rows[0]?.citation;
}

export async function downloadPublicPublication(id) {
  const query = `
    SELECT
      file_path

    FROM ora_ebook_manuscripts

    WHERE id = $1
  `;

  const { rows } = await db.query(query, [id]);

  return rows[0]?.file_path;
}

//