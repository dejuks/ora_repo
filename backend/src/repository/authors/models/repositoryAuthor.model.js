// models/repositoryAuthor.model.js
import  pool  from '../../../config/db.js';

class RepositoryAuthor {

    // Create author profile
    static async create(authorData) {
        const {
            user_id,
            professional_title,
            academic_affiliation,
            department,
            country,
            phone,
            research_interest,
            orcid_id,
            biography,
            website_url,
            google_scholar_url,
            researchgate_url,
            linkedin_url,
            twitter_handle,
            verification_document_url
        } = authorData;

        const query = `
            INSERT INTO repository_author (
                user_id, professional_title, academic_affiliation, department,
                country, phone, research_interest, orcid_id, biography,
                website_url, google_scholar_url, researchgate_url,
                linkedin_url, twitter_handle, verification_document_url
            ) 
            VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
                $11,$12,$13,$14,$15
            )
            RETURNING *
        `;

        const values = [
            user_id, professional_title, academic_affiliation, department,
            country, phone, research_interest, orcid_id, biography,
            website_url, google_scholar_url, researchgate_url,
            linkedin_url, twitter_handle, verification_document_url
        ];

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Find author by user_id
    static async findByUserId(userId) {
        const query = `
            SELECT 
                ra.*,
                u.email,
                u.full_name,
                u.role,
                u.is_active,
                u.is_verified AS user_verified
            FROM repository_author ra
            JOIN users u ON ra.user_id = u.id
            WHERE ra.user_id = $1 
            AND u.deleted_at IS NULL
        `;
        
        const result = await pool.query(query, [userId]);
        return result.rows[0] || null;
    }

    // Find author by ID
    static async findById(id) {
        const query = `
            SELECT 
                ra.*,
                u.email,
                u.full_name,
                u.role,
                u.is_active
            FROM repository_author ra
            JOIN users u ON ra.user_id = u.id
            WHERE ra.id = $1 
            AND u.deleted_at IS NULL
        `;
        
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    }

    // Find author by ORCID
    static async findByOrcid(orcidId) {
        const query = `
            SELECT 
                ra.*,
                u.email,
                u.full_name
            FROM repository_author ra
            JOIN users u ON ra.user_id = u.id
            WHERE ra.orcid_id = $1 
            AND u.deleted_at IS NULL
        `;
        
        const result = await pool.query(query, [orcidId]);
        return result.rows[0] || null;
    }

    // Get all authors with pagination + filters
    static async findAll(page = 1, limit = 10, filters = {}) {
        let baseQuery = `
            FROM repository_author ra
            JOIN users u ON ra.user_id = u.id
            WHERE u.deleted_at IS NULL
        `;

        const values = [];
        let paramIndex = 1;

        if (filters.country) {
            baseQuery += ` AND ra.country = $${paramIndex++}`;
            values.push(filters.country);
        }

        if (filters.academic_affiliation) {
            baseQuery += ` AND ra.academic_affiliation ILIKE $${paramIndex++}`;
            values.push(`%${filters.academic_affiliation}%`);
        }

        if (filters.research_interest) {
            baseQuery += ` AND ra.research_interest ILIKE $${paramIndex++}`;
            values.push(`%${filters.research_interest}%`);
        }

        if (filters.department) {
            baseQuery += ` AND ra.department ILIKE $${paramIndex++}`;
            values.push(`%${filters.department}%`);
        }

        // ✅ COUNT (FIXED)
        const countResult = await pool.query(
            `SELECT COUNT(*) ${baseQuery}`,
            values
        );
        const total = parseInt(countResult.rows[0].count);

        const offset = (page - 1) * limit;

        const query = `
            SELECT 
                ra.*,
                u.email,
                u.full_name,
                u.role
            ${baseQuery}
            ORDER BY ra.created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const result = await pool.query(query, [...values, limit, offset]);

        return {
            authors: result.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // Update author profile
    static async update(userId, updateData) {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        const allowedFields = [
            'professional_title', 'academic_affiliation', 'department',
            'country', 'phone', 'research_interest', 'orcid_id',
            'biography', 'website_url', 'google_scholar_url',
            'researchgate_url', 'linkedin_url', 'twitter_handle',
            'verification_document_url', 'is_verified'
        ];

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                fields.push(`${field} = $${paramIndex++}`);
                values.push(updateData[field]);
            }
        }

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);

        const query = `
            UPDATE repository_author
            SET ${fields.join(', ')}
            WHERE user_id = $${paramIndex}
            RETURNING *
        `;

        values.push(userId);

        const result = await pool.query(query, values);
        return result.rows[0] || null;
    }

    // Update publication stats
    static async updateStats(userId, stats) {
        const query = `
            UPDATE repository_author
            SET 
                publications_count = COALESCE(publications_count, 0) + $1,
                citation_count = COALESCE(citation_count, 0) + $2,
                h_index = $3,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $4
            RETURNING *
        `;

        const result = await pool.query(query, [
            stats.publications_increment || 0,
            stats.citations_increment || 0,
            stats.h_index ?? null,
            userId
        ]);

        return result.rows[0] || null;
    }

    // Soft delete (user-based)
    static async delete(userId) {
        const result = await pool.query(`
            UPDATE users
            SET deleted_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING id
        `, [userId]);

        return result.rows[0] || null;
    }

    // Search authors
    static async search(searchTerm, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const searchPattern = `%${searchTerm}%`;

        const baseQuery = `
            FROM repository_author ra
            JOIN users u ON ra.user_id = u.id
            WHERE u.deleted_at IS NULL
            AND (
                u.full_name ILIKE $1 OR
                ra.academic_affiliation ILIKE $1 OR
                ra.department ILIKE $1 OR
                ra.research_interest ILIKE $1 OR
                ra.country ILIKE $1
            )
        `;

        const dataQuery = `
            SELECT ra.*, u.full_name, u.email
            ${baseQuery}
            ORDER BY ra.publications_count DESC
            LIMIT $2 OFFSET $3
        `;

        const result = await pool.query(dataQuery, [
            searchPattern,
            limit,
            offset
        ]);

        const countResult = await pool.query(
            `SELECT COUNT(*) ${baseQuery}`,
            [searchPattern]
        );

        const total = parseInt(countResult.rows[0].count);

        return {
            authors: result.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}

export default RepositoryAuthor;