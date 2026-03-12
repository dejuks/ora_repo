// controllers/categoryController.js
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoryTree,
  getCategoriesWithParent,
  updateCategory,
  deleteCategory,
  createBulkCategories,
  getCategoryStats
} from "../models/WikiCategory.js";

// CREATE: Create new category
export const createNewCategory = async (req, res) => {
  try {
    const categoryData = req.body;
    const userId = req.user.id;

    if (!categoryData.name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    const category = await createCategory(categoryData, userId);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create category"
    });
  }
};

// READ: Get all categories
export const getCategories = async (req, res) => {
  try {
    const { tree, with_parent } = req.query;

    let categories;
    if (tree === 'true') {
      categories = await getCategoryTree();
    } else if (with_parent === 'true') {
      categories = await getCategoriesWithParent();
    } else {
      categories = await getAllCategories();
    }

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get categories"
    });
  }
};

// READ: Get category by ID
export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await getCategoryById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get category"
    });
  }
};

// UPDATE: Update category
export const updateCategoryHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingCategory = await getCategoryById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    const updatedCategory = await updateCategory(id, updateData);

    res.json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update category"
    });
  }
};

// DELETE: Delete category
export const deleteCategoryHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const existingCategory = await getCategoryById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    const result = await deleteCategory(id);

    res.json({
      success: true,
      message: "Category deleted successfully",
      data: result
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete category"
    });
  }
};

// BULK CREATE: Create multiple categories
export const createBulkCategoriesHandler = async (req, res) => {
  try {
    const { categories } = req.body;
    const userId = req.user.id;

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of categories"
      });
    }

    const results = await createBulkCategories(categories, userId);

    res.status(201).json({
      success: true,
      message: `${results.length} categories created successfully`,
      data: results
    });
  } catch (error) {
    console.error("Bulk create categories error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create categories"
    });
  }
};

// GET: Category statistics
export const getCategoryStatistics = async (req, res) => {
  try {
    const stats = await getCategoryStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Get category stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get category statistics"
    });
  }
};

// GET: Simple options for dropdown
export const getCategoryOptions = async (req, res) => {
  try {
    const categories = await getAllCategories();
    
    const options = categories.map(cat => ({
      value: cat.id,
      label: cat.name
    }));

    res.json({
      success: true,
      data: options
    });
  } catch (error) {
    console.error("Get category options error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get category options"
    });
  }
};