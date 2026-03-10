// models/WikiCategory.js
import pool from "../../config/db.js";

// CREATE: Create new category
export const createCategory = async (categoryData, userId) => {
  const client = await pool.connect();
  
  try {
    const { name, description, parent_id } = categoryData;

    // Check if category with same name exists
    const existing = await client.query(
      "SELECT id FROM wiki_categories WHERE name = $1",
      [name]
    );

    if (existing.rows.length > 0) {
      throw new Error("Category with this name already exists");
    }

    const result = await client.query(
      `
      INSERT INTO wiki_categories (
        name,
        description,
        parent_id,
        created_by,
        created_at
      )
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, name, description, parent_id, created_at
      `,
      [name, description || null, parent_id || null, userId]
    );

    return result.rows[0];
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

// READ: Get all categories (simple list)
export const getAllCategories = async () => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `
      SELECT 
        id, 
        name, 
        description, 
        parent_id, 
        created_at
      FROM wiki_categories 
      ORDER BY name ASC
      `
    );

    return result.rows;
  } finally {
    client.release();
  }
};

// READ: Get category by ID
export const getCategoryById = async (categoryId) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `
      SELECT 
        id, 
        name, 
        description, 
        parent_id, 
        created_at
      FROM wiki_categories 
      WHERE id = $1
      `,
      [categoryId]
    );

    return result.rows[0];
  } finally {
    client.release();
  }
};

// READ: Get categories as simple tree structure
export const getCategoryTree = async () => {
  const client = await pool.connect();
  
  try {
    // Get all categories first
    const allCategories = await client.query(
      `SELECT id, name, description, parent_id FROM wiki_categories ORDER BY name`
    );

    // Build tree in JavaScript (simpler)
    const categoryMap = {};
    const roots = [];

    // First pass: create map
    allCategories.rows.forEach(cat => {
      categoryMap[cat.id] = { ...cat, children: [] };
    });

    // Second pass: build tree
    allCategories.rows.forEach(cat => {
      if (cat.parent_id && categoryMap[cat.parent_id]) {
        categoryMap[cat.parent_id].children.push(categoryMap[cat.id]);
      } else {
        roots.push(categoryMap[cat.id]);
      }
    });

    return roots;
  } finally {
    client.release();
  }
};

// READ: Get flat list with parent names
export const getCategoriesWithParent = async () => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `
      SELECT 
        c.id,
        c.name,
        c.description,
        c.parent_id,
        p.name as parent_name
      FROM wiki_categories c
      LEFT JOIN wiki_categories p ON c.parent_id = p.id
      ORDER BY c.name ASC
      `
    );

    return result.rows;
  } finally {
    client.release();
  }
};

// UPDATE: Update category
export const updateCategory = async (categoryId, updateData) => {
  const client = await pool.connect();
  
  try {
    const { name, description, parent_id } = updateData;

    // Check if name already exists (excluding current category)
    if (name) {
      const existing = await client.query(
        "SELECT id FROM wiki_categories WHERE name = $1 AND id != $2",
        [name, categoryId]
      );

      if (existing.rows.length > 0) {
        throw new Error("Category with this name already exists");
      }
    }

    // Simple circular reference check
    if (parent_id && parent_id === categoryId) {
      throw new Error("Category cannot be its own parent");
    }

    const result = await client.query(
      `
      UPDATE wiki_categories 
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        parent_id = $3
      WHERE id = $4
      RETURNING id, name, description, parent_id
      `,
      [name, description, parent_id || null, categoryId]
    );

    return result.rows[0];
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

// DELETE: Delete category
export const deleteCategory = async (categoryId) => {
  const client = await pool.connect();
  
  try {
    // Simple check for child categories
    const childCheck = await client.query(
      "SELECT id FROM wiki_categories WHERE parent_id = $1 LIMIT 1",
      [categoryId]
    );

    if (childCheck.rows.length > 0) {
      throw new Error("Cannot delete category with subcategories. Delete or reassign subcategories first.");
    }

    const result = await client.query(
      "DELETE FROM wiki_categories WHERE id = $1 RETURNING id",
      [categoryId]
    );

    return result.rows[0];
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

// BULK: Create multiple categories
export const createBulkCategories = async (categories, userId) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");

    const results = [];
    for (const category of categories) {
      const result = await client.query(
        `
        INSERT INTO wiki_categories (name, description, parent_id, created_by, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING id, name
        `,
        [category.name, category.description || null, category.parent_id || null, userId]
      );
      results.push(result.rows[0]);
    }

    await client.query("COMMIT");
    return results;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// GET: Simple category stats
export const getCategoryStats = async () => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `
      SELECT 
        COUNT(*) as total_categories,
        COUNT(CASE WHEN parent_id IS NULL THEN 1 END) as root_categories,
        COUNT(CASE WHEN parent_id IS NOT NULL THEN 1 END) as sub_categories
      FROM wiki_categories
      `
    );

    return result.rows[0];
  } finally {
    client.release();
  }
};