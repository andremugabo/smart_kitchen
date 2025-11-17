import {
  listUnits,
  getUnit,
  createUnit,
  updateUnit,
  deleteUnit,
} from "../services/unitService.js";

export const listUnitsController = async (req, res) => {
  try {
    const items = await listUnits();
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

export const getUnitController = async (req, res) => {
  try {
    const item = await getUnit(req.params.id);
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(404).json({ success: false, error: e.message });
  }
};

export const createUnitController = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, error: "name is required" });
    }
    const item = await createUnit({ name, description });
    res.status(201).json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const updateUnitController = async (req, res) => {
  try {
    const item = await updateUnit(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const deleteUnitController = async (req, res) => {
  try {
    await deleteUnit(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};