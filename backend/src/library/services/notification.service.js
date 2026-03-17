import pool from "../../config/db.js";

export const notificationService = {
  async create({ userId = null, memberId = null, type, title, message, relatedEntityType = null, relatedEntityId = null }, client = pool) {
    if (!userId && !memberId) return null;
    const { rows } = await client.query(
      `INSERT INTO library_notifications (user_id, member_id, notification_type, title, message, related_entity_type, related_entity_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [userId, memberId, type, title, message, relatedEntityType, relatedEntityId]
    );
    return rows[0];
  },

  async createForMember(memberId, payload, client = pool) {
    const { rows } = await client.query(`SELECT user_id FROM library_members WHERE member_id = $1`, [memberId]);
    const userId = rows[0]?.user_id || null;
    return this.create({ userId, memberId, ...payload }, client);
  },
};
