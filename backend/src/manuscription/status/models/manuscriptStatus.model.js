import ManuscriptStatus from "../models/manuscriptStatus.model.js";

export const getStatuses = async (req, res) => {
  res.json(await ManuscriptStatus.findAll());
};

export const getStatus = async (req, res) => {
  res.json(await ManuscriptStatus.findById(req.params.id));
};

export const createStatus = async (req, res) => {
  res.status(201).json(await ManuscriptStatus.create(req.body));
};

export const updateStatus = async (req, res) => {
  res.json(await ManuscriptStatus.update(req.params.id, req.body));
};

export const deleteStatus = async (req, res) => {
  await ManuscriptStatus.delete(req.params.id);
  res.json({ message: "Deleted successfully" });
};
