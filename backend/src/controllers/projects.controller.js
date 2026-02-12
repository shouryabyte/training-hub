const Project = require("../models/Project");

async function listProjects(_req, res) {
  const projects = await Project.find().sort({ isFeatured: -1, createdAt: -1 });
  return res.json(projects);
}

async function createProject(req, res) {
  const created = await Project.create(req.validated.body);
  return res.status(201).json(created);
}

async function updateProject(req, res) {
  const { id } = req.validated.params;
  const updated = await Project.findByIdAndUpdate(id, { $set: req.validated.body }, { new: true });
  if (!updated) return res.status(404).json({ message: "Project not found" });
  return res.json(updated);
}

async function deleteProject(req, res) {
  const id = String(req.params.id || "");
  const deleted = await Project.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: "Project not found" });
  return res.json({ success: true });
}

module.exports = { listProjects, createProject, updateProject, deleteProject };
