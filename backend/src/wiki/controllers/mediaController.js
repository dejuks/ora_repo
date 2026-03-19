// controllers/mediaController.js
import {
  createMedia,
  getAllMedia,
  getMediaById,
  getMediaByArticle,
  getMediaByUser,
  updateMedia,
  deleteMedia,
  getMediaStats
} from "../models/wikiMedia.model.js";
import path from 'path';
import fs from 'fs';

// CREATE: Upload new media
export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const userId = req.user?.uuid;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const mediaData = req.body;
    const media = await createMedia(mediaData, userId, req.file);

    res.status(201).json({
      success: true,
      message: "Media uploaded successfully",
      data: media
    });

  } catch (error) {
    console.error("Upload media error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload media"
    });
  }
};

// READ: Get all media
export const getMedia = async (req, res) => {
  try {
    const {
      file_type,
      article_id,
      uploaded_by,
      page = 1,
      limit = 20
    } = req.query;

    const filters = {
      file_type,
      article_id,
      uploaded_by
    };

    const result = await getAllMedia(filters, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Get media error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get media"
    });
  }
};

// READ: Get media by ID
export const getMediaItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const media = await getMediaById(id);
    
    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found"
      });
    }

    res.json({
      success: true,
      data: media
    });
  } catch (error) {
    console.error("Get media item error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get media"
    });
  }
};

// READ: Get media by article
export const getArticleMedia = async (req, res) => {
  try {
    const { articleId } = req.params;
    
    const media = await getMediaByArticle(articleId);

    res.json({
      success: true,
      data: media
    });
  } catch (error) {
    console.error("Get article media error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get article media"
    });
  }
};

// READ: Get my uploaded media
export const getMyMedia = async (req, res) => {
  try {
    const userId = req.user?.uuid;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }
    
    const media = await getMediaByUser(userId);

    res.json({
      success: true,
      data: media
    });
  } catch (error) {
    console.error("Get my media error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get your media"
    });
  }
};

// UPDATE: Update media metadata
export const updateMediaItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user?.uuid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const media = await getMediaById(id);
    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found"
      });
    }

    // Check permission (admin or uploader)
    if (media.uploaded_by !== userId && req.user?.role !== 'administrator') {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this media"
      });
    }

    const updatedMedia = await updateMedia(id, updateData, userId);

    res.json({
      success: true,
      message: "Media updated successfully",
      data: updatedMedia
    });
  } catch (error) {
    console.error("Update media error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update media"
    });
  }
};

// DELETE: Delete media
export const deleteMediaItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uuid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const media = await getMediaById(id);
    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found"
      });
    }

    // Check permission (admin or uploader)
    if (media.uploaded_by !== userId && req.user?.role !== 'administrator') {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this media"
      });
    }

    const result = await deleteMedia(id, userId);

    res.json({
      success: true,
      message: "Media deleted successfully",
      data: result
    });
  } catch (error) {
    console.error("Delete media error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete media"
    });
  }
};

// GET: Media statistics
export const getMediaStatistics = async (req, res) => {
  try {
    const stats = await getMediaStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Get media stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get media statistics"
    });
  }
};