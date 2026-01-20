import { Module } from "../models/module.model.js";

export const getModules = async (req, res) => {
  try {
    const modules = await Module.findAll();
    res.json(modules);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch modules" });
  }
};

export const getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.uuid);
    if (!module) return res.status(404).json({ message: "Module not found" });
    res.json(module);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch module" });
  }
};

export const createModule = async (req, res) => {
  try {
    const { name, description } = req.body;
    const module = await Module.create({ name, description });
    res.status(201).json(module);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create module" });
  }
};

export const updateModule = async (req, res) => {
  try {
    const { name, description } = req.body;
    const module = await Module.update(req.params.uuid, { name, description });
    res.json(module);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update module" });
  }
};

export const deleteModule = async (req, res) => {
  try {
    await Module.delete(req.params.uuid);
    res.json({ message: "Module deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete module" });
  }
};
