import * as AdminModel from "../models/admin.model.js";

export const listPendingResearchers = async (req, res) => {
  try {
    const users = await AdminModel.getPendingResearchers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const approveResearcher = async (req, res) => {
  try {
    const userId = req.params.userId;
    const updated = await AdminModel.approveResearcher(userId);
    if (!updated) return res.status(404).json({ message: "Researcher not found" });
    res.json({ message: "Researcher approved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
