import {
  listOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  getKitchenOrders,
  getCurrentWaiterOrders,
} from "../services/orderService.js";

export const listOrdersController = async (req, res) => {
  try {
    const items = await listOrders();
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

export const getOrderController = async (req, res) => {
  try {
    const item = await getOrder(req.params.id);
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(404).json({ success: false, error: e.message });
  }
};

export const createOrderController = async (req, res) => {
  try {
    const { user_id, table_number, items } = req.body;
    if (!user_id || !items) {
      return res.status(400).json({
        success: false,
        error: "user_id and items are required",
      });
    }
    const order = await createOrder({ user_id, table_number, items });
    res.status(201).json({ success: true, data: order });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const updateOrderStatusController = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res
        .status(400)
        .json({ success: false, error: "status is required" });
    }
    const order = await updateOrderStatus(req.params.id, status);
    res.json({ success: true, data: order });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const deleteOrderController = async (req, res) => {
  try {
    await deleteOrder(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const getKitchenOrdersController = async (req, res) => {
  try {
    const data = await getKitchenOrders();
    res.json({ success: true, data });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const getCurrentWaiterOrdersController = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, error: "Unauthorized: missing user" });
    }
    const data = await getCurrentWaiterOrders(userId);
    res.json({ success: true, data });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};
