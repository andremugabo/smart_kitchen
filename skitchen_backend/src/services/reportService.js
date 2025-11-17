import { Order, OrderDetail, Menu, PurchaseHistory } from "../models/index.js";
import { Op } from "sequelize";

export const getSalesSummary = async ({ from, to }) => {
  const where = {};
  if (from || to) {
    where.order_date = {};
    if (from) where.order_date[Op.gte] = new Date(from);
    if (to) where.order_date[Op.lte] = new Date(to);
  }

  const orders = await Order.findAll({ where });

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const totalOrders = orders.length;

  return {
    totalRevenue,
    totalOrders,
  };
};

export const getMenuPerformance = async ({ from, to }) => {
  const whereOrders = {};
  if (from || to) {
    whereOrders.order_date = {};
    if (from) whereOrders.order_date[Op.gte] = new Date(from);
    if (to) whereOrders.order_date[Op.lte] = new Date(to);
  }

  const orders = await Order.findAll({
    where: whereOrders,
    attributes: ["id"],
  });

  if (!orders.length) return [];

  const orderIds = orders.map((o) => o.id);

  const details = await OrderDetail.findAll({
    where: { order_id: orderIds },
    include: [{ model: Menu }],
  });

  const map = new Map();

  for (const d of details) {
    const menu = d.Menu;
    if (!menu) continue;
    const key = menu.id;
    if (!map.has(key)) {
      map.set(key, {
        menuId: menu.id,
        name: menu.name,
        ordersCount: 0,
        quantitySold: 0,
        revenue: 0,
      });
    }
    const entry = map.get(key);
    entry.ordersCount += 1;
    entry.quantitySold += Number(d.quantity || 0);
    entry.revenue += Number(d.price_at_time || 0) * Number(d.quantity || 0);
  }

  return Array.from(map.values());
};

export const getPurchaseSummary = async ({ from, to }) => {
  const where = {};
  if (from || to) {
    where.purchase_date = {};
    if (from) where.purchase_date[Op.gte] = new Date(from);
    if (to) where.purchase_date[Op.lte] = new Date(to);
  }

  const purchases = await PurchaseHistory.findAll({ where });

  const totalSpend = purchases.reduce(
    (sum, p) => sum + Number(p.quantity || 0) * Number(p.price_per_unit || 0),
    0
  );

  return {
    totalSpend,
    totalPurchases: purchases.length,
  };
};
