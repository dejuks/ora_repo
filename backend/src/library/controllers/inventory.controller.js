import { inventoryService } from '../services/inventory.service.js';

export const inventoryController = {
  async createAudit(req, res) {
    try {
      const result = await inventoryService.createAudit(req.body, req.user);
      return res.status(201).json(result);
    } catch (error) {
      console.error('Failed to create inventory audit:', error);
      return res.status(500).json({ message: error.message || 'Failed to create inventory audit' });
    }
  },

  async report(req, res) {
    try {
      const result = await inventoryService.getReport();
      return res.json(result);
    } catch (error) {
      console.error('Failed to load inventory report:', error);
      return res.status(500).json({ message: 'Failed to load inventory report' });
    }
  },
};
