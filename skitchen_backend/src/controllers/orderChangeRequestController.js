import {
  createOrderChangeRequest,
  approveOrderChangeRequest,
  rejectOrderChangeRequest,
  listOrderChangeRequests,
} from "../services/orderChangeRequestService.js";

export const createOrderChangeRequestController = async (req, res) => {
  try {
    const { order_id, order_detail_id, type, reason } = req.body;
    const requested_by = req.user?.id;
    if (!requested_by) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const item = await createOrderChangeRequest({
      order_id,
      order_detail_id,
      type,
      requested_by,
      reason,
    });

    res.status(201).json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const listOrderChangeRequestsController = async (req, res) => {
  try {
    const { status, type, order_id } = req.query;
    const items = await listOrderChangeRequests({ status, type, order_id });
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const approveOrderChangeRequestController = async (req, res) => {
  try {
    const approved_by = req.user?.id;
    if (!approved_by) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { response_message } = req.body;
    const data = await approveOrderChangeRequest({
      request_id: req.params.id,
      approved_by,
      response_message,
    });

    res.json({ success: true, data });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const rejectOrderChangeRequestController = async (req, res) => {
  try {
    const approved_by = req.user?.id;
    if (!approved_by) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { response_message } = req.body;
    const data = await rejectOrderChangeRequest({
      request_id: req.params.id,
      approved_by,
      response_message,
    });

    res.json({ success: true, data });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};
