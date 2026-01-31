import pool from "../../config/db.js";

const Manuscript = {

  /* GET ALL (with joins for UI) */
  findAll: async () => {
    const res = await pool.query(`
      SELECT 
        m.*,
        ms.label AS status_label,
        j.title AS journal_title,
        js.name AS section_name
      FROM manuscripts m
      LEFT JOIN manuscript_statuses ms ON ms.id = m.status_id
      LEFT JOIN journals j ON j.id = m.journal_id
      LEFT JOIN journal_sections js ON js.id = m.section_id
      GROUP BY m.id, ms.label, j.title, js.name
      ORDER BY m.created_at DESC
    `);
    return res.rows;
  },

  /* GET ONE */
  findById: async (id) => {
    const res = await pool.query(`
      SELECT 
        m.*,
        ms.label AS status_label,
        j.title AS journal_title,
        js.name AS section_name,
        json_agg(json_build_object('id', a.id, 'name', a.name, 'corresponding', ma.corresponding)) AS authors
      FROM manuscripts m
      LEFT JOIN manuscript_statuses ms ON ms.id = m.status_id
      LEFT JOIN journals j ON j.id = m.journal_id
      LEFT JOIN journal_sections js ON js.id = m.section_id
      LEFT JOIN manuscript_authors ma ON ma.manuscript_id = m.id
      LEFT JOIN authors a ON a.id = ma.author_id
      WHERE m.id=$1
      GROUP BY m.id, ms.label, j.title, js.name
    `, [id]);

    return res.rows[0];
  },

  /* CREATE */
  create: async (data) => {
    const {
      journal_id,
      section_id,
      title,
      abstract,
      keywords,
      language,
      article_type,
      status_id,
      submission_date,
      additional_notes,
      manuscript_files,
      created_by,
      author_ids = [],
      corresponding_author_id,
    } = data;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const res = await client.query(
        `INSERT INTO manuscripts
          (journal_id, section_id, title, abstract, keywords,
           language, article_type, status_id, submission_date,
           additional_notes, manuscript_files, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         RETURNING *`,
        [
          journal_id,
          section_id,
          title,
          abstract,
          keywords,
          language,
          article_type,
          status_id,
          submission_date ?? new Date(),
          additional_notes,
          manuscript_files,
          created_by,
        ]
      );

      const manuscript = res.rows[0];

      // Insert authors
      if (author_ids.length > 0) {
        const insertAuthorsQuery = `
          INSERT INTO manuscript_authors(manuscript_id, author_id, corresponding)
          VALUES ${author_ids.map((_, i) => `($1,$${i+2}, $${i+2})`).join(",")}
        `;
        const authorValues = [manuscript.id, ...author_ids.map(id => id === corresponding_author_id)];
        await client.query(insertAuthorsQuery, authorValues);
      }

      await client.query("COMMIT");
      return manuscript;

    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  /* UPDATE */
  update: async (id, data) => {
    const {
      journal_id,
      section_id,
      title,
      abstract,
      keywords,
      language,
      article_type,
      status_id,
      current_version,
      additional_notes,
      manuscript_files,
      author_ids = [],
      corresponding_author_id,
    } = data;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const res = await client.query(
        `UPDATE manuscripts SET
          journal_id=$1,
          section_id=$2,
          title=$3,
          abstract=$4,
          keywords=$5,
          language=$6,
          article_type=$7,
          status_id=$8,
          current_version=$9,
          additional_notes=$10,
          manuscript_files=$11,
          updated_at=NOW()
         WHERE id=$12
         RETURNING *`,
        [
          journal_id,
          section_id,
          title,
          abstract,
          keywords,
          language,
          article_type,
          status_id,
          current_version,
          additional_notes,
          manuscript_files,
          id,
        ]
      );

      // Update authors
      if (author_ids.length > 0) {
        await client.query("DELETE FROM manuscript_authors WHERE manuscript_id=$1", [id]);
        const insertAuthorsQuery = `
          INSERT INTO manuscript_authors(manuscript_id, author_id, corresponding)
          VALUES ${author_ids.map((_, i) => `($1,$${i+2}, $${i+2})`).join(",")}
        `;
        const authorValues = [id, ...author_ids.map(aid => aid === corresponding_author_id)];
        await client.query(insertAuthorsQuery, authorValues);
      }

      await client.query("COMMIT");
      return res.rows[0];

    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  /* UPDATE STATUS ONLY */
  updateStatus: async (id, status_id) => {
    const res = await pool.query(
      `UPDATE manuscripts
       SET status_id=$1, updated_at=NOW()
       WHERE id=$2
       RETURNING *`,
      [status_id, id]
    );
    return res.rows[0];
  },

  /* DELETE */
  delete: async (id) => {
    await pool.query("DELETE FROM manuscripts WHERE id=$1", [id]);
    return true;
  },

/* ================= INVITE CO-AUTHOR ================= */
addCoAuthor: async ({ manuscript_id, user_id, invited_by }) => {
  const res = await pool.query(
    `INSERT INTO manuscript_co_authors (manuscript_id, user_id, invited_by)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [manuscript_id, user_id, invited_by]
  );
  return res.rows[0];
},


  getCoAuthors: async (manuscript_id) => {
    const res = await pool.query(
      `SELECT u.uuid, u.name, u.email, mca.status, mca.created_at
       FROM manuscript_co_authors mca
       JOIN users u ON u.uuid = mca.user_id
       WHERE mca.manuscript_id = $1
       ORDER BY mca.created_at`,
      [manuscript_id]
    );
    return res.rows;
  },
  /* ================= ACCEPT / REJECT ================= */
  updateCoAuthorStatus: async (manuscript_id, user_id, status) => {
    const res = await pool.query(
      `UPDATE manuscript_co_authors
       SET status = $1
       WHERE manuscript_id = $2 AND user_id = $3
       RETURNING *`,
      [status, manuscript_id, user_id]
    );
    return res.rows[0];
  },

  // Get co-authors invited by a specific user
// manuscript.model.js
 getMyInvitedCoAuthors : async (invited_by) => {
  const res = await pool.query(
    `
    SELECT
      mca.id,
      mca.manuscript_id,
      mca.status,
      mca.created_at,

      u.uuid       AS user_id,
      u.full_name  AS user_name,
      u.email      AS user_email,

      m.title      AS manuscript_title
    FROM manuscript_co_authors mca
    JOIN users u ON u.uuid = mca.user_id
    JOIN manuscripts m ON m.id = mca.manuscript_id
    WHERE mca.invited_by = $1
    ORDER BY mca.created_at DESC
    `,
    [invited_by]
  );

  return res.rows;
}


  };



export default Manuscript;
