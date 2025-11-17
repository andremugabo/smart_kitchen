import { Payment, Order, OrderDetail, Menu, User } from "../models/index.js";
import { Op } from "sequelize";


export const listPayments = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const { rows, count } = await Payment.findAndCountAll({
    order: [["payment_date", "DESC"]],
    limit,
    offset,
  });
  return { rows, count };
};

export const getPayment = async (id) => {
  const item = await Payment.findByPk(id, {
    include: [{ model: Order }],
  });
  if (!item) throw new Error("Payment not found");
  return item;
};

export const createPayment = async (data) => {
  const order = await Order.findByPk(data.order_id);
  if (!order) throw new Error("Order not found");

  const payment = await Payment.create({
    order_id: data.order_id,
    amount: data.amount,
    method: data.method,
    status: data.status ?? "paid",
  });

  return payment;
};

export const updatePaymentStatus = async (id, status) => {
  const payment = await getPayment(id);
  await payment.update({ status, updated_at: new Date() });
  return payment;
};

export const getReceiptData = async (paymentId) => {
  const payment = await Payment.findByPk(paymentId, {
    include: [{ model: Order }],
  });
  if (!payment) throw new Error("Payment not found");

  const order = payment.Order;
  if (!order) throw new Error("Order not linked to payment");

  const details = await OrderDetail.findAll({
    where: { order_id: order.id },
    include: [{ model: Menu }],
  });

  let user = null;
  if (order.user_id) {
    user = await User.findByPk(order.user_id);
  }

  return { payment, order, details, user };
};

export const getPaymentsForReport = async ({ from, to }) => {
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

  return { payments, totalAmount };
};
