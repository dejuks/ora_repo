// src/ebooks/controllers/ebook_controller.js
const Ebook = require("../models/ebook");
const { validationResult } = require("express-validator");

class EbookController {
  // Get all ebooks
  static async getAllEbooks(req, res) {
    try {
      const filters = {
        status: req.query.status,
        editor_id: req.query.editor_id,
      };

      // Remove undefined filters
      Object.keys(filters).forEach(
        (key) => filters[key] === undefined && delete filters[key],
      );

      const ebooks = await Ebook.findAll(filters);

      return res.status(200).json({
        success: true,
        count: ebooks.length,
        data: ebooks,
      });
    } catch (error) {
      console.error("Error fetching ebooks:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching ebooks",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  // Get single ebook by ID
  static async getEbookById(req, res) {
    try {
      const { id } = req.params;
      const ebook = await Ebook.findById(id);

      if (!ebook) {
        return res.status(404).json({
          success: false,
          message: "Ebook not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: ebook,
      });
    } catch (error) {
      console.error("Error fetching ebook:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching ebook",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  // Create new ebook
  static async createEbook(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const ebookData = {
        ...req.body,
        editor_id: req.user?.id || req.body.editor_id,
      };

      // Validate editor_id
      if (!ebookData.editor_id) {
        return res.status(400).json({
          success: false,
          message: "Editor ID is required",
        });
      }

      const newEbook = await Ebook.create(ebookData);

      return res.status(201).json({
        success: true,
        message: "Ebook created successfully",
        data: newEbook,
      });
    } catch (error) {
      console.error("Error creating ebook:", error);
      return res.status(500).json({
        success: false,
        message: "Error creating ebook",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  // Update ebook
  static async updateEbook(req, res) {
    try {
      const { id } = req.params;
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const existingEbook = await Ebook.findById(id);
      if (!existingEbook) {
        return res.status(404).json({
          success: false,
          message: "Ebook not found",
        });
      }

      // Check if user has permission to update this ebook
      if (
        req.user?.role !== "admin" &&
        existingEbook.editor_id !== req.user?.id
      ) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to update this ebook",
        });
      }

      const updatedEbook = await Ebook.update(id, req.body);

      return res.status(200).json({
        success: true,
        message: "Ebook updated successfully",
        data: updatedEbook,
      });
    } catch (error) {
      console.error("Error updating ebook:", error);
      return res.status(500).json({
        success: false,
        message: "Error updating ebook",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  // Delete ebook
  static async deleteEbook(req, res) {
    try {
      const { id } = req.params;

      const existingEbook = await Ebook.findById(id);
      if (!existingEbook) {
        return res.status(404).json({
          success: false,
          message: "Ebook not found",
        });
      }

      await Ebook.delete(id);

      return res.status(200).json({
        success: true,
        message: "Ebook deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting ebook:", error);
      return res.status(500).json({
        success: false,
        message: "Error deleting ebook",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  // Update ebook status
  static async updateEbookStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ["draft", "published", "archived"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid status value. Must be one of: " + validStatuses.join(", "),
        });
      }

      const existingEbook = await Ebook.findById(id);
      if (!existingEbook) {
        return res.status(404).json({
          success: false,
          message: "Ebook not found",
        });
      }

      const updatedEbook = await Ebook.updateStatus(id, status);

      return res.status(200).json({
        success: true,
        message: "Ebook status updated successfully",
        data: updatedEbook,
      });
    } catch (error) {
      console.error("Error updating ebook status:", error);
      return res.status(500).json({
        success: false,
        message: "Error updating ebook status",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  // Get ebooks by editor
  static async getEbooksByEditor(req, res) {
    try {
      const { editorId } = req.params;
      const ebooks = await Ebook.findByEditor(editorId);

      return res.status(200).json({
        success: true,
        count: ebooks.length,
        data: ebooks,
      });
    } catch (error) {
      console.error("Error fetching editor ebooks:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching editor ebooks",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  // Search ebooks
  static async searchEbooks(req, res) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: "Search query is required",
        });
      }

      const ebooks = await Ebook.search(q);

      return res.status(200).json({
        success: true,
        count: ebooks.length,
        data: ebooks,
      });
    } catch (error) {
      console.error("Error searching ebooks:", error);
      return res.status(500).json({
        success: false,
        message: "Error searching ebooks",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
}

module.exports = EbookController;
