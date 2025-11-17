import PDFDocument from "pdfkit";
import { Op } from "sequelize";
import {
  listPayments,
  getPayment,
  createPayment,
  updatePaymentStatus,
  getReceiptData,
} from "../services/paymentService.js";
import { Payment } from "../models/index.js";

export const listPaymentsController = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const { rows, count } = await listPayments(page, limit);
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

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=receipt-${payment.id}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(20).text("Smart Kitchen Receipt", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Receipt ID: ${payment.id}`);
    doc.text(`Order ID: ${order.id}`);
    if (user) {
      doc.text(`Customer: ${user.username || user.email || user.id}`);
    }
    doc.text(`Payment Date: ${new Date(payment.payment_date).toLocaleString()}`);
    doc.text(`Payment Method: ${payment.method}`);
    doc.text(`Payment Status: ${payment.status}`);

    doc.moveDown();
    doc.fontSize(14).text("Items:");
    doc.moveDown(0.5);

    details.forEach((d) => {
      const name = d.Menu ? d.Menu.name : d.menu_id;
      const qty = Number(d.quantity || 0);
      const price = Number(d.price_at_time || 0);
      const line = price * qty;
      doc
        .fontSize(12)
        .text(`${name} x ${qty} @ ${price.toFixed(2)} = ${line.toFixed(2)}`);
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total Paid: ${Number(payment.amount).toFixed(2)}`);

    doc.end();
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
    });

    const totalAmount = payments.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "inline; filename=payments-report.pdf"
    );

    doc.pipe(res);

    doc.fontSize(20).text("Payments Report", { align: "center" });
    doc.moveDown();

    if (from || to) {
      doc
        .fontSize(12)
        .text(
          `Period: ${from || "(start)"} to ${to || "(now)"}`,
          { align: "center" }
        );
      doc.moveDown();
    }

    doc.fontSize(12).text(`Total payments: ${payments.length}`);
    doc.fontSize(12).text(`Total amount: ${totalAmount.toFixed(2)}`);
    doc.moveDown();

    doc.fontSize(14).text("Details:");
    doc.moveDown(0.5);

    payments.forEach((p) => {
      doc
        .fontSize(11)
        .text(
          `${new Date(p.payment_date).toLocaleString()} | Order: ${p.order_id} | Method: ${p.method} | Status: ${p.status} | Amount: ${Number(
            p.amount
          ).toFixed(2)}`
        );
    });

    doc.end();
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};
