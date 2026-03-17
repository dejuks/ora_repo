import { libraryReportService } from "../services/libraryReport.service.js";

export const libraryReportController = {
  async summary(req, res) {
    try {
      const data = await libraryReportService.summary();
      return res.json(data);
    } catch (error) {
      console.error('Failed to build library summary:', error);
      return res.status(500).json({ message: 'Failed to build library summary' });
    }
  },

  async overdueLoans(req, res) {
    try {
      const data = await libraryReportService.overdueLoans();
      return res.json(data);
    } catch (error) {
      console.error('Failed to fetch overdue loans:', error);
      return res.status(500).json({ message: 'Failed to fetch overdue loans' });
    }
  },

  async usage(req, res) {
    try {
      const data = await libraryReportService.usageReport();
      return res.json(data);
    } catch (error) {
      console.error('Failed to fetch usage report:', error);
      return res.status(500).json({ message: 'Failed to fetch usage report' });
    }
  },

  async loans(req, res) {
    try {
      const data = await libraryReportService.loansReport();
      return res.json(data);
    } catch (error) {
      console.error('Failed to fetch loans report:', error);
      return res.status(500).json({ message: 'Failed to fetch loans report' });
    }
  },
};
