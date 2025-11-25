import PDFDocument from "pdfkit";
import { Op } from "sequelize";
import path from "path";
import { fileURLToPath } from "url";
import QRCode from "qrcode";
import {
  listPayments,
  getPayment,
  createPayment,
  updatePaymentStatus,
  getReceiptData,
  getPaymentsSummary,
} from "../services/paymentService.js";
import { Payment, Order, User } from "../models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// controllers/ -> src/ -> backend root -> public/logo.png
const logoPath = path.join(__dirname, "..", "..", "public", "logo.png");

export const listPaymentsController = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const { order_id } = req.query;
    const { rows, count } = await listPayments({ page, limit, order_id });
    res.json({
      success: true,
      data: rows,
      meta: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit) || 1,
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

export const getPaymentController = async (req, res) => {
  try {
    const item = await getPayment(req.params.id);
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(404).json({ success: false, error: e.message });
  }
};

export const createPaymentController = async (req, res) => {
  try {
    const { order_id, amount, method, status } = req.body;
    if (!order_id || !amount || !method) {
      return res.status(400).json({
        success: false,
        error: "order_id, amount and method are required",
      });
    }
    const item = await createPayment({ order_id, amount, method, status });
    res.status(201).json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const updatePaymentStatusController = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res
        .status(400)
        .json({ success: false, error: "status is required" });
    }
    const item = await updatePaymentStatus(req.params.id, status);
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const generateReceiptPdfController = async (req, res) => {
  try {
    const { payment, order, details, user } = await getReceiptData(
      req.params.id
    );

    // Narrow receipt-style document (58mm thermal width approx.)
    const doc = new PDFDocument({ margin: 12, size: [164, 600] });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=receipt-${payment.id}.pdf`
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
      // If logo is missing, skip silently
    }

    doc
      .fontSize(18)
      .fillColor("#000000")
      .text("SMART KITCHEN", { align: "center" });
    doc
      .fontSize(9)
      .fillColor("#555555")
      .text("Payment receipt", { align: "center" });
    doc.moveDown(0.5);
    doc
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .stroke("#dddddd");
    doc.moveDown(0.5);

    const formatTwo = (v) => String(v).padStart(2, "0");
    const paymentRef = `PAY-${String(payment.id).slice(0, 4).toUpperCase()}`;
    const orderRef = `ORD-${String(order.id).slice(0, 4).toUpperCase()}`;
    const dt = payment.payment_date ? new Date(payment.payment_date) : null;
    const dateLabel = dt
      ? `${dt.getFullYear()}-${formatTwo(dt.getMonth() + 1)}-${formatTwo(
          dt.getDate()
        )} ${formatTwo(dt.getHours())}:${formatTwo(dt.getMinutes())}`
      : "-";

    doc.fontSize(10).fillColor("#000000");
    doc.text(`Payment: ${paymentRef}`);
    doc.text(`Order: ${orderRef}`);
    if (user) {
      const name = user.username || user.name || user.full_name || user.email;
      if (name) {
        doc.text(`Waiter: ${name}`);
      }
    }
    if (order && order.table_number) {
      doc.text(`Table: ${order.table_number}`);
    }
    doc.text(`Payment Date: ${dateLabel}`);
    doc.text(`Method: ${payment.method}`);
    doc.text(`Status: ${payment.status}`);

    doc.moveDown(0.5);
    doc
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .stroke("#dddddd");
    doc.moveDown(0.5);

    doc.fontSize(11).text("Items:");
    doc.moveDown(0.25);

    details.forEach((d) => {
      const name = d.Menu ? d.Menu.name : d.menu_id;
      const qty = Number(d.quantity || 0);
      const price = Number(d.price_at_time || 0);
      const line = price * qty;

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

      doc
        .fontSize(9)
        .fillColor("#111827")
        .text(`${name} x ${qty} @ ${price.toFixed(2)} = ${line.toFixed(2)}`);
      doc.moveDown(0.05);
    });

    doc.moveDown(0.5);
    doc
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .stroke("#000000");
    doc.moveDown(0.5);

    const qrPayload = {
      type: "payment",
      orderId: order.id,
      orderRef,
      paymentId: payment.id,
      paymentRef,
      amount: Number(payment.amount || 0),
      status: payment.status,
      method: payment.method,
      date: payment.payment_date,
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
    doc
      .fontSize(10)
      .fillColor("#0f172a")
      .text(`Order: ${orderRef}`);

    doc
      .moveDown(0.2)
      .fontSize(11)
      .fillColor("#16a34a")
      .text(`Total Paid: ${Number(payment.amount).toFixed(2)}`, {
        align: "right",
      });

    // PAYMENT QR code with compact JSON payload
    try {
      const qrPayload = {
        type: "payment",
        orderId: order.id,
        orderRef,
        paymentId: payment.id,
        paymentRef,
        amount: Number(payment.amount || 0),
        status: payment.status,
        method: payment.method,
        date: payment.payment_date,
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

export const paymentsSummaryController = async (req, res) => {
  try {
    const { from, to } = req.query;
    const summary = await getPaymentsSummary({ from, to });
    res.json({ success: true, data: summary });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const generatePaymentsReportPdfController = async (req, res) => {
  try {
    const { from, to } = req.query;

    const where = {};
    if (from || to) {
      where.payment_date = {};
      if (from) where.payment_date[Op.gte] = new Date(from);
      if (to) where.payment_date[Op.lte] = new Date(to);
    }

    const payments = await Payment.findAll({
      where,
      order: [["payment_date", "ASC"]],
      include: [
        {
          model: Order,
          include: [User],
        },
      ],
    });

    let totalAmount = 0;
    const revenueByMethod = {};
    const ordersByStatus = {};

    payments.forEach((p) => {
      const amount = Number(p.amount || 0);
      const method = p.method || "unknown";
      totalAmount += amount;

      if (p.status === "paid") {
        revenueByMethod[method] = (revenueByMethod[method] || 0) + amount;
      }

      if (p.status) {
        ordersByStatus[p.status] = (ordersByStatus[p.status] || 0) + 1;
      }
    });

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "inline; filename=payments-report.pdf"
    );

    doc.pipe(res);

    try {
      doc.image(logoPath, {
        fit: [80, 80],
        align: "center",
      });
      doc.moveDown(0.5);
    } catch (e) {
      // optional logo
    }

    doc.fontSize(22).fillColor("#000000").text("SMART KITCHEN", {
      align: "center",
    });
    doc.fontSize(12).fillColor("#555555").text("Payments report", {
      align: "center",
    });
    doc.moveDown(0.5);

    if (from || to) {
      doc
        .fontSize(12)
        .text(
          `Period: ${from || "(start)"} to ${to || "(now)"}`,
          { align: "center" }
        );
      doc.moveDown();
    }

    doc.fontSize(11).fillColor("#0f172a");
    doc.text(`Total payments: ${payments.length}`);
    doc.text(`Total amount: ${totalAmount.toFixed(2)}`);
    doc.moveDown();

    // Orders by status summary with status colors
    if (Object.keys(ordersByStatus).length > 0) {
      doc.fontSize(12).fillColor("#000000").text("Orders by status:");
      Object.entries(ordersByStatus).forEach(([status, count]) => {
        let color = "#9ca3af"; // default gray
        if (status === "completed" || status === "paid") color = "#22c55e"; // green
        else if (status === "pending" || status === "preparing") color = "#f97316"; // orange
        else if (status === "failed" || status === "canceled") color = "#ef4444"; // red
        else if (status === "refunded") color = "#3b82f6"; // blue

        doc
          .fontSize(10)
          .fillColor(color)
          .text(`• ${status}: ${count}`);
      });
      doc.moveDown(0.5);
    }

    // Revenue by payment method with method colors
    if (Object.keys(revenueByMethod).length > 0) {
      doc.fontSize(12).fillColor("#000000").text("Revenue by payment method:");
      Object.entries(revenueByMethod).forEach(([method, amount]) => {
        let color = "#9ca3af";
        if (method === "cash") color = "#22c55e"; // green
        else if (method === "card") color = "#3b82f6"; // blue
        else if (method === "mobile") color = "#a855f7"; // purple
        else if (method === "tab") color = "#f59e0b"; // amber

        doc
          .fontSize(10)
          .fillColor(color)
          .text(`• ${method}: ${Number(amount).toFixed(2)}`);
      });
      doc.moveDown(0.75);
    }

    // Section title
    doc
      .fontSize(12)
      .fillColor("#000000")
      .text("Details", { underline: true });
    doc.moveDown(0.5);

    // Table-style header
    doc
      .fontSize(10)
      .fillColor("#4b5563")
      .text("Date / Time", { continued: true })
      .text("    | Payment / Order", { continued: true })
      .text("    | Method", { continued: true })
      .text("    | Status", { continued: true })
      .text("    | Amount");

    doc.moveDown(0.25);
    doc
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .stroke("#e5e7eb");
    doc.moveDown(0.25);

    const formatTwo = (v) => String(v).padStart(2, "0");

    payments.forEach((p) => {
      const dtObj = p.payment_date ? new Date(p.payment_date) : null;
      const dt = dtObj
        ? `${dtObj.getFullYear()}-${formatTwo(dtObj.getMonth() + 1)}-${formatTwo(
            dtObj.getDate()
          )} ${formatTwo(dtObj.getHours())}:${formatTwo(dtObj.getMinutes())}`
        : "-";
      const paymentRef = `PAY-${String(p.id).slice(0, 4).toUpperCase()}`;
      const orderRef = p.order_id
        ? `ORD-${String(p.order_id).slice(0, 4).toUpperCase()}`
        : "-";
      const order = p.Order;
      const customerName =
        order && order.User
          ? order.User.username ||
            order.User.name ||
            order.User.full_name ||
            order.User.email
          : null;
      const tableNumber = order ? order.table_number : null;
      const baseText = `${dt} | ${paymentRef} / ${orderRef} | ${p.method}`;
      const amountText = Number(p.amount).toFixed(2);

      // Color status text
      let statusColor = "#9ca3af"; // default grey
      if (p.status === "paid") statusColor = "#22c55e"; // green
      else if (p.status === "pending") statusColor = "#f97316"; // orange
      else if (p.status === "failed") statusColor = "#ef4444"; // red
      else if (p.status === "refunded") statusColor = "#3b82f6"; // blue

      // Slight tinted background band for readability
      const yStart = doc.y;
      doc
        .rect(
          doc.page.margins.left,
          yStart - 1,
          doc.page.width - doc.page.margins.left - doc.page.margins.right,
          14
        )
        .fillOpacity(0.02)
        .fill("#64748b")
        .fillOpacity(1);
      doc.y = yStart;

      doc
        .fontSize(9)
        .fillColor("#111827")
        .text(baseText, { continued: true })
        .text(" | ", { continued: true })
        .fillColor(statusColor)
        .text(p.status, { continued: true })
        .fillColor("#111827")
        .text(" | " + amountText);

      if (customerName || tableNumber) {
        doc
          .moveDown(0.05)
          .fontSize(8)
          .fillColor("#6b7280")
          .text(
            `    ${customerName || "Guest"}${
              tableNumber ? ` · Table ${tableNumber}` : ""
            }`
          );
      }

      doc.moveDown(0.1);
    });

    doc.end();
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};
