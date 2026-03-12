import Manuscript from "../models/manuscript.model.js";
import pool from "../../config/db.js";
import fs from "fs";
import path from "path";

/* LIST ALL */
export const getManuscripts = async (req, res) => {
  try {
    const manuscripts = await Manuscript.findAll();
    res.json(manuscripts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch manuscripts" });
  }
};

/* GET ONE */
export const getManuscript = async (req, res) => {
  try {
    const manuscript = await Manuscript.findById(req.params.id);
    if (!manuscript) return res.status(404).json({ error: "Manuscript not found" });
    res.json(manuscript);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch manuscript" });
  }
};

/* CREATE */
export const createManuscript = async (req, res) => {
  try {
    const manuscript_files = req.file
      ? `/uploads/manuscripts/${req.file.filename}`
      : null;

    const manuscript = await Manuscript.create({
      ...req.body,
      manuscript_files,
      author_ids: req.body.author_ids
        ? JSON.parse(req.body.author_ids)
        : [],
    });

    res.status(201).json(manuscript);
  } catch (err) {
    console.error("Error creating manuscript:", err);
    res.status(500).json({ message: err.message });
  }
};


/* UPDATE */
export const updateManuscript = async (req, res) => {
  try {
    // Handle file upload
    if (req.file) {
      req.body.manuscript_file = req.file.path;
    }

    const manuscript = await Manuscript.update(req.params.id, req.body);
    res.json(manuscript);
  } catch (err) {
    console.error("Error updating manuscript:", err);
    res.status(500).json({ error: err.message || "Failed to update manuscript" });
  }
};

/* UPDATE STATUS ONLY */
export const updateManuscriptStatus = async (req, res) => {
  try {
    const { status_id } = req.body;
    const manuscript = await Manuscript.updateStatus(req.params.id, status_id);
    res.json(manuscript);
  } catch (err) {
    console.error("Error updating manuscript status:", err);
    res.status(500).json({ error: err.message || "Failed to update status" });
  }
};

/* DELETE */
export const deleteManuscript = async (req, res) => {
  try {
    const manuscript = await Manuscript.findById(req.params.id);
    if (!manuscript) return res.status(404).json({ error: "Manuscript not found" });

    // Delete associated file if exists
    if (manuscript.manuscript_file && fs.existsSync(manuscript.manuscript_file)) {
      fs.unlinkSync(manuscript.manuscript_file);
    }

    await Manuscript.delete(req.params.id);
    res.json({ message: "Manuscript deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete manuscript" });
  }
};/* ================= INVITE CO-AUTHOR ================= */
export const inviteCoAuthor = async (req, res) => {
  try {
    const manuscript_id = req.params.id;
    const { user_id } = req.body;

    const invited_by = req.user?.uuid; // 🔹 logged-in user

    // validations
    if (!manuscript_id) return res.status(400).json({ message: "manuscript_id is required" });
    if (!user_id) return res.status(400).json({ message: "user_id (co-author) is required" });
    if (!invited_by) return res.status(400).json({ message: "invited_by (logged-in user) is required" });

    // call model to insert into manuscript_co_authors
    const invite = await Manuscript.addCoAuthor({
      manuscript_id,
      user_id,
      invited_by,
    });

    res.status(201).json(invite);

  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "User already invited" });
    }
    console.error("Invite failed:", err);
    res.status(500).json({ message: "Invite failed" });
  }
};
// manuscript.controller.js
export const getMyInvitedCoAuthors = async (req, res) => {
  try {
    const invited_by = req.user.uuid; // 🔒 logged user

    const data = await Manuscript.getMyInvitedCoAuthors(invited_by);

    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load invites" });
  }
};



/* ================= GET CO-AUTHORS ================= */
export const getCoAuthors = async (req, res) => {
  try {
    const authors = await Manuscript.getCoAuthors(req.params.id);
    res.json(authors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load co-authors" });
  }
};

/* ================= ACCEPT / REJECT ================= */
export const updateCoAuthorStatus = async (req, res) => {
  try {
    const { status } = req.body; // accepted | rejected
    const { id, userId } = req.params;

    const updated = await Manuscript.updateCoAuthorStatus(
      id,
      userId,
      status
    );

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update status" });
  }
};

/* ================= EIC SUBMITTED MANUSCRIPTS ================= */
export const getEICSubmissions = async (req, res) => {
  try {
    // Use model to get only manuscripts with status 'submitted'
    // Assuming your manuscript_statuses table has a label 'Submitted'
    const resAll = await Manuscript.findAll();

    const submittedManuscripts = resAll.filter(
      (m) => m.status_label?.toLowerCase() === "submitted"
    );

    res.json(submittedManuscripts);
  } catch (err) {
    console.error("EIC submissions error:", err);
    res.status(500).json({ error: "Failed to fetch EIC submissions" });
  }
};

/* ================= EIC: ASSIGN EDITORS ================= */
export const getManuscriptsForAssignEditors = async (req, res) => {
  try {
    // Fetch all submitted manuscripts
    const resAll = await Manuscript.findAll();

    const submittedManuscripts = resAll.filter(
      (m) => m.status_label?.toLowerCase() === "submitted"
    );

    // Optionally, include assigned editor info (assuming m.assigned_editor_id exists)
    // If not, just send null
    res.json(
      submittedManuscripts.map((m) => ({
        ...m,
        assigned_editor: m.assigned_editor_name || null,
      }))
    );
  } catch (err) {
    console.error("EIC assign editors error:", err);
    res.status(500).json({ error: "Failed to fetch manuscripts" });
  }
};

/* ================= ASSIGN EDITOR ================= */
export const assignEditor = async (req, res) => {
  const client = await pool.connect();

  try {
    const { manuscriptId, editorId } = req.body;

    if (!manuscriptId || !editorId) {
      return res.status(400).json({
        message: "manuscriptId and editorId are required"
      });
    }

    await client.query("BEGIN");

    /* ---------- Check manuscript exists ---------- */
    const manuscriptCheck = await client.query(
      "SELECT id FROM manuscripts WHERE id=$1",
      [manuscriptId]
    );

    if (manuscriptCheck.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Manuscript not found" });
    }

    /* ---------- Check editor exists ---------- */
    const editorCheck = await client.query(
      "SELECT uuid FROM users WHERE uuid=$1",
      [editorId]
    );

    if (editorCheck.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Editor not found" });
    }

    /* ---------- Update assignment ---------- */
    const updated = await client.query(
      `
      UPDATE manuscripts
      SET assigned_editor_id=$1,
          updated_at=NOW()
      WHERE id=$2
      RETURNING *
      `,
      [editorId, manuscriptId]
    );

    await client.query("COMMIT");

    return res.json({
      message: "Editor assigned successfully",
      manuscript: updated.rows[0]
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Assign editor failed:", err);

    res.status(500).json({
      message: "Failed to assign editor",
      error: err.message
    });

  } finally {
    client.release();
  }
};
export const getEditors = async (req, res) => {
  try {

    const editorRoleId = "45494844-658a-4837-8df6-f6fc61348bbb";

    const result = await pool.query(
      `
      SELECT 
        u.uuid,
        u.full_name,
        u.email
      FROM users u
      INNER JOIN user_roles ur 
        ON ur.user_id = u.uuid
      WHERE ur.role_id = $1
      ORDER BY u.full_name ASC
      `,
      [editorRoleId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error("Failed to load editors:", err);

    res.status(500).json({
      error: "Failed to load editors"
    });
  }
};


export const getManuscriptsForFinalDecision = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        m.id,
        m.title AS manuscript_title,
        j.title AS journal_title,
        s.name AS section_name,
        ms.label AS status_label,         -- join status labels
        d.name AS final_decision
      FROM manuscripts m
      -- Join journals table
      LEFT JOIN journals j
        ON j.id = m.journal_id
      -- Join sections table
      LEFT JOIN journal_sections s
        ON s.id = m.section_id
      -- Join manuscript_statuses table
      LEFT JOIN manuscript_statuses ms
        ON ms.id = m.status_id
      -- Join decisions table
      LEFT JOIN decisions d
        ON d.id = m.final_decision_id
      WHERE ms.label IN ('Submitted', 'Assigned')  -- filter by label instead of id
      ORDER BY m.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Final decision list error:", err);
    res.status(500).json({ error: "Failed to fetch manuscripts" });
  }
};


/* ================= EIC FINAL DECISIONS: MAKE DECISION ================= */
export const makeFinalDecision = async (req, res) => {
  const client = await pool.connect();

  try {
    const { manuscriptId, decision } = req.body; // decision = decision_id (UUID)

    if (!manuscriptId || !decision) {
      return res.status(400).json({
        message: "manuscriptId and decision (UUID) are required",
      });
    }

    await client.query("BEGIN");

    // 1️⃣ Validate manuscript
    const manuscriptRes = await client.query(
      "SELECT final_decision_id FROM manuscripts WHERE id = $1",
      [manuscriptId]
    );

    if (manuscriptRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Manuscript not found" });
    }

    if (manuscriptRes.rows[0].final_decision_id) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Final decision already made" });
    }

    // 2️⃣ Validate decision UUID
    const decisionRes = await client.query(
      "SELECT name FROM decisions WHERE id = $1",
      [decision]
    );

    if (decisionRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Invalid decision" });
    }

    const decisionName = decisionRes.rows[0].name;

    // 3️⃣ Map decision to a valid manuscript_status label
    const decisionToStatusMap = {
      Accept: "Accepted",
      "Minor Revision": "Minor Revision",
      "Major Revision": "Major Revision",
      Reject: "Rejected",
    };

    const statusLabel = decisionToStatusMap[decisionName];

    if (!statusLabel) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: `No corresponding manuscript status found for decision '${decisionName}'`,
      });
    }

    // 4️⃣ Get status_id from manuscript_statuses
    const statusRes = await client.query(
      "SELECT id FROM manuscript_statuses WHERE label = $1",
      [statusLabel]
    );

    if (statusRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(500).json({
        message: `Status label '${statusLabel}' not found in manuscript_statuses`,
      });
    }

    const statusId = statusRes.rows[0].id;

    // 5️⃣ Update manuscript
    const update = await client.query(
      `
      UPDATE manuscripts
      SET
        final_decision_id = $1,
        final_decided_at = NOW(),
        status_id = $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING id, final_decision_id, status_id
      `,
      [decision, statusId, manuscriptId]
    );

    // 6️⃣ Get human-readable status label
    const statusQuery = await client.query(
      "SELECT label FROM manuscript_statuses WHERE id = $1",
      [statusId]
    );

    await client.query("COMMIT");

    res.json({
      message: "Final decision saved successfully",
      manuscript: {
        final_decision: decisionName,
        status_label: statusQuery.rows[0]?.label || null,
      },
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Final decision error:", err);
    res.status(500).json({ message: "Failed to save final decision" });
  } finally {
    client.release();
  }
};




export const getEICManuscriptDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const manuscript = await Manuscript.findById(id);
    if (!manuscript) return res.status(404).json({ error: "Manuscript not found" });
    res.json(manuscript);
  } catch (err) {
    console.error("Failed to fetch manuscript details:", err);
    res.status(500).json({ error: "Failed to fetch manuscript details" });
  }
};

export const updateScreeningStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { screening_status } = req.body;

    if (!["passed", "failed"].includes(screening_status)) {
      return res.status(400).json({
        message: "Invalid screening status",
      });
    }

    const result = await pool.query(
      `
      UPDATE manuscripts
      SET screening_status = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
      `,
      [screening_status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Manuscript not found",
      });
    }

    return res.json({
      message: "Screening updated successfully",
      manuscript: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getEthicsManuscripts = async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT
        m.id,
        m.title,
        m.ethics_status,
        m.ethics_notes,
        m.created_at,

        u.email AS author_email,
        u.full_name AS author_name,

        ed.email AS assigned_editor_email

      FROM manuscripts m
      LEFT JOIN users u
      ON u.uuid = m.author_id

      LEFT JOIN users ed
      ON ed.uuid = m.assigned_editor_id

      ORDER BY m.created_at DESC
    `);

    res.json(result.rows);

  } catch (err) {
    console.error("Ethics load error:", err);
    res.status(500).json({ error: "Failed to load ethics manuscripts" });
  }
};

export const updateEthicsDecision = async (req, res) => {
  try {

    const {
      manuscriptId,
      ethicsStatus,
      ethicsNotes,
      userId
    } = req.body;

    await pool.query(`
      UPDATE manuscripts
      SET
        ethics_status = $1,
        ethics_notes = $2,
        ethics_checked_by = $3,
        ethics_checked_at = NOW()
      WHERE id = $4
    `, [
      ethicsStatus,
      ethicsNotes,
      userId,
      manuscriptId
    ]);

    res.json({ message: "Ethics updated successfully" });

  } catch (err) {
    console.error("Ethics update failed:", err);
    res.status(500).json({ error: "Failed to update ethics" });
  }
};

/* ================= EIC PRODUCTION LIST ================= */
export const getProductionManuscripts = async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT 
        m.id,
        m.title,
        m.production_status,
        m.production_notes,
        m.doi,
        m.publication_date,
        u.email AS assigned_editor_email,
        au.email AS author_email
      FROM manuscripts m
      LEFT JOIN users u 
        ON u.uuid = m.assigned_editor_id
      LEFT JOIN users au 
        ON au.uuid = m.author_id
      WHERE m.final_decision = 'Accept'
      ORDER BY m.created_at DESC
    `);

    res.json(result.rows);

  } catch (err) {
    console.error("Production load failed:", err);
    res.status(500).json({ message: "Failed to load production manuscripts" });
  }
};


/* ================= UPDATE PRODUCTION ================= */
export const updateProduction = async (req, res) => {

  try {

    const {
      manuscriptId,
      productionStatus,
      productionNotes,
      doi,
      publicationDate
    } = req.body;

    await pool.query(
      `
      UPDATE manuscripts
      SET 
        production_status=$1,
        production_notes=$2,
        doi=$3,
        publication_date=$4,
        updated_at=NOW()
      WHERE id=$5
      `,
      [
        productionStatus,
        productionNotes,
        doi,
        publicationDate,
        manuscriptId
      ]
    );

    res.json({ message: "Production updated successfully" });

  } catch (err) {
    console.error("Production update failed:", err);
    res.status(500).json({ message: "Production update failed" });
  }
};
// getDecisions
export const getDecisions = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM decisions");
    res.json(result.rows);
  } catch (err) {
    console.error("Failed to get decisions:", err);
    res.status(500).json({ error: "Failed to get decisions" });
  }
};  