import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";
import QRCode from "qrcode";
import {
  listOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  getKitchenOrders,
  getCurrentWaiterOrders,
  addItemsToOrder,
} from "../services/orderService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// controllers/ -> src/ -> backend root -> public/logo.png
const logoPath = path.join(__dirname, "..", "..", "public", "logo.png");

export const listOrdersController = async (req, res) => {
  try {
    const items = await listOrders();
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

export const addItemsToOrderController = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items) {
      return res
        .status(400)
        .json({ success: false, error: "items are required" });
    }
    const order = await addItemsToOrder(req.params.id, items);
    res.json({ success: true, data: order });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
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

export const generateOrderReceiptPdfController = async (req, res) => {
  try {
    const order = await getOrder(req.params.id);

    // Narrow receipt-style document (58mm thermal width approx.)
    const doc = new PDFDocument({ margin: 12, size: [164, 600] });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=order-${order.id}-receipt.pdf`
    );

    doc.pipe(res);

    // Header / logo
    try {
      doc.image(logoPath, {
        fit: [40, 40],
        align: "center",
      });
      doc.moveDown(0.3);
    } catch (e) {
      // logo optional
    }

    doc
      .fontSize(18)
      .fillColor("#000000")
      .text("SMART KITCHEN", { align: "center" });
    doc
      .fontSize(9)
      .fillColor("#555555")
      .text("Order receipt", { align: "center" });
    doc.moveDown(0.5);
    doc
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .stroke("#dddddd");
    doc.moveDown(0.5);

    const formatOrderCode = (id) => {
      if (!id) return "ORD-????";
      const core = id.length > 4 ? id.substring(0, 4) : id;
      return `ORD-${core.toUpperCase()}`;
    };

    doc.fontSize(10).fillColor("#000000");
    doc.text(`Order: ${formatOrderCode(order.id)}`);
    if (order.User) {
      const name =
        order.User.username ||
        order.User.name ||
        order.User.full_name ||
        order.User.email;
      if (name) {
        doc.text(`Waiter: ${name}`);
      }
    }
    if (order.table_number) {
      doc.text(`Table: ${order.table_number}`);
    }
    if (order.order_date) {
      doc.text(`Date: ${new Date(order.order_date).toLocaleString()}`);
    }
    doc.text(`Status: ${order.status}`);

    doc.moveDown(0.5);
    doc
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .stroke("#dddddd");
    doc.moveDown(0.5);

    const details = order.OrderDetails || [];
    doc.fontSize(11).text("Items:");
    doc.moveDown(0.25);

    details.forEach((d) => {
      const name = d.Menu ? d.Menu.name : d.menu_id;
      const qty = Number(d.quantity || 0);
      const price = Number(d.price_at_time || 0);
      const line = price * qty;
      let lineText = `${name} x ${qty} @ ${price.toFixed(2)} = ${line.toFixed(2)}`;
      if (d.kitchen_note) {
        lineText += `  (Note: ${d.kitchen_note})`;
      }

      // Light band behind each item row for readability on thermal paper
      const yStart = doc.y;
      doc
        .rect(
          doc.page.margins.left,
          yStart - 1,
          doc.page.width - doc.page.margins.left - doc.page.margins.right,
          12
        )
        .fillOpacity(0.03)
        .fill("#64748b")
        .fillOpacity(1);
      doc.y = yStart;

      doc.fontSize(9).fillColor("#111827").text(lineText);
      doc.moveDown(0.05);
    });

    doc.moveDown(0.5);
    doc
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .stroke("#000000");
    doc.moveDown(0.3);

    // Highlight grand total
    doc
      .fontSize(11)
      .fillColor("#16a34a")
      .text(`Grand Total: ${Number(order.total_amount || 0).toFixed(2)}`,{ align: "right" });

    // ORDER QR code with compact JSON payload
    try {
      const qrPayload = {
        type: "order",
        orderId: order.id,
        table: order.table_number,
        total: Number(order.total_amount || 0),
        status: order.status,
        date: order.order_date,
      };

      const qrBuffer = await QRCode.toBuffer(JSON.stringify(qrPayload), {
        width: 120,
        margin: 1,
      });

      doc.moveDown(0.5);
      doc.image(qrBuffer, {
        fit: [50, 50],
        align: "center",
      });
    } catch (e) {
      // If QR generation fails, skip it silently
    }

    doc.end();
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
