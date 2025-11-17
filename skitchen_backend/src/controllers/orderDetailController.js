import {
  listOrderDetailsByOrder,
  getOrderDetail,
  updateOrderDetail,
  deleteOrderDetail,
} from "../services/orderDetailService.js";

export const listOrderDetailsByOrderController = async (req, res) => {
  try {
    const items = await listOrderDetailsByOrder(req.params.orderId);
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const getOrderDetailController = async (req, res) => {
  try {
    const item = await getOrderDetail(req.params.id);
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(404).json({ success: false, error: e.message });
  }
};

export const updateOrderDetailController = async (req, res) => {
  try {
    const item = await updateOrderDetail(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const deleteOrderDetailController = async (req, res) => {
  try {
    await deleteOrderDetail(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};
