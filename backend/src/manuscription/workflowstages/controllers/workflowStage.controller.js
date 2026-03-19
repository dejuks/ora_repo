import WorkflowStage from "../models/workflowStage.model.js";

export const createStage = async (req, res) => {
  try {
    const { name, stage_order } = req.body;
    const stage = await WorkflowStage.create(name, stage_order);
    res.status(201).json(stage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllStages = async (req, res) => {
  try {
    const stages = await WorkflowStage.findAll();
    res.json(stages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStageById = async (req, res) => {
  try {
    const stage = await WorkflowStage.findById(req.params.id);
    res.json(stage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateStage = async (req, res) => {
  try {
    const { name, stage_order } = req.body;
    const stage = await WorkflowStage.update(
      req.params.id,
      name,
      stage_order
    );
    res.json(stage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteStage = async (req, res) => {
  try {
    await WorkflowStage.delete(req.params.id);
    res.json({ message: "Stage deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
