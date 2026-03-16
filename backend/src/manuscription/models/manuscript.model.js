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
        js.name AS section_name
      FROM manuscripts m
      LEFT JOIN manuscript_statuses ms ON ms.id = m.status_id
      LEFT JOIN journals j ON j.id = m.journal_id
      LEFT JOIN journal_sections js ON js.id = m.section_id
      WHERE m.id=$1
    `, [id]);

    return res.rows[0];
  },

  /* CREATE - only inserts into manuscripts */
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
    } = data;

    const res = await pool.query(
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

    return res.rows[0];
  },

  /* UPDATE - only updates manuscripts */
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
    } = data;

    const res = await pool.query(
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

    return res.rows[0];
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
  findByUser: async (userId) => {
  const res = await pool.query(`
    SELECT 
      m.*,
      ms.label AS status_label
    FROM manuscripts m
    LEFT JOIN manuscript_statuses ms ON ms.id = m.status_id
    WHERE m.created_by = $1
    ORDER BY m.created_at DESC
  `, [userId]);
  return res.rows;
}
};


export default Manuscript;
