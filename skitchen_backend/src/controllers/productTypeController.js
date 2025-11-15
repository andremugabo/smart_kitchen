import {
  listProductTypes,
  getProductType,
  createProductType,
  updateProductType,
  deleteProductType,
} from "../services/productTypeService.js";

export const listProductTypesController = async (req, res) => {
  try {
    const items = await listProductTypes();
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

export const getProductTypeController = async (req, res) => {
  try {
    const item = await getProductType(req.params.id);
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(404).json({ success: false, error: e.message });
  }
};

export const createProductTypeController = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, error: "name is required" });
    const item = await createProductType({ name, description });
    res.status(201).json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const updateProductTypeController = async (req, res) => {
  try {
    const { name, description } = req.body;
    const item = await updateProductType(req.params.id, { name, description });
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const deleteProductTypeController = async (req, res) => {
  try {
    await deleteProductType(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};
