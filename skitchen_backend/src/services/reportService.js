import { Order, OrderDetail, Menu, PurchaseHistory, User } from "../models/index.js";
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

export const getSalesOverTime = async ({ from, to }) => {
  const where = {};
  if (from || to) {
    where.order_date = {};
    if (from) where.order_date[Op.gte] = new Date(from);
    if (to) where.order_date[Op.lte] = new Date(to);
  }

  const orders = await Order.findAll({ where });

  const map = new Map();

  const normalizeStatus = (rawStatus) => {
    const s = (rawStatus || "unknown").toLowerCase();
    if (s === "pending" || s === "preparing" || s === "in_kitchen") return "in_progress";
    if (s === "completed" || s === "served") return "completed";
    if (s === "canceled" || s === "cancelled") return "canceled";
    if (s === "failed" || s === "refunded") return s;
    return "other";
  };

  for (const o of orders) {
    const d = o.order_date ? new Date(o.order_date) : new Date();
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    if (!map.has(key)) {
      map.set(key, {
        date: key,
        totalRevenue: 0,
        totalOrders: 0,
        statusCounts: {},
      });
    }
    const entry = map.get(key);
    entry.totalRevenue += Number(o.total_amount || 0);
    entry.totalOrders += 1;

    const status = normalizeStatus(o.status);
    if (!entry.statusCounts[status]) {
      entry.statusCounts[status] = 0;
    }
    entry.statusCounts[status] += 1;
  }

  return Array.from(map.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
};

export const getWaiterPerformance = async ({ from, to }) => {
  const where = {};
  if (from || to) {
    where.order_date = {};
    if (from) where.order_date[Op.gte] = new Date(from);
    if (to) where.order_date[Op.lte] = new Date(to);
  }

  // Focus on orders that reached served/completed
  where.status = { [Op.in]: ["served", "completed"] };

  const orders = await Order.findAll({ where, include: [{ model: User }] });

  const byWaiter = new Map();

  for (const o of orders) {
    const waiter = o.User;
    if (!waiter || waiter.role !== "waiter") continue;

    const key = waiter.id;
    if (!byWaiter.has(key)) {
      byWaiter.set(key, {
        waiterId: waiter.id,
        waiterName: waiter.username,
        totalOrdersServed: 0,
        totalRevenue: 0,
        hourlyDistribution: {},
      });
    }

    const entry = byWaiter.get(key);
    entry.totalOrdersServed += 1;
    entry.totalRevenue += Number(o.total_amount || 0);

    const d = o.order_date ? new Date(o.order_date) : new Date();
    const hour = d.toISOString().slice(11, 13); // HH
    entry.hourlyDistribution[hour] = (entry.hourlyDistribution[hour] || 0) + 1;
  }

  const result = Array.from(byWaiter.values()).map((w) => {
    const avgOrderValue = w.totalOrdersServed
      ? w.totalRevenue / w.totalOrdersServed
      : 0;

    let peakHour = null;
    let peakCount = 0;
    for (const [hour, count] of Object.entries(w.hourlyDistribution)) {
      if (count > peakCount) {
        peakCount = count;
        peakHour = hour;
      }
    }

    return {
      ...w,
      averageOrderValue: avgOrderValue,
      peakHour,
    };
  });

  return result;
};

export const getChefPerformance = async ({ from, to }) => {
  const whereOrder = {};
  if (from || to) {
    whereOrder.order_date = {};
    if (from) whereOrder.order_date[Op.gte] = new Date(from);
    if (to) whereOrder.order_date[Op.lte] = new Date(to);
  }

  const details = await OrderDetail.findAll({
    include: [
      {
        model: Order,
        where: whereOrder,
      },
      {
        model: User,
        as: "Chef",
      },
    ],
  });

  const byChef = new Map();

  for (const d of details) {
    const chef = d.Chef;
    if (!chef || chef.role !== "chef") continue;

    const key = chef.id;
    if (!byChef.has(key)) {
      byChef.set(key, {
        chefId: chef.id,
        chefName: chef.username,
        dishesPrepared: 0,
        totalPrepTimeMinutes: 0,
        prepSamples: 0,
      });
    }

    const entry = byChef.get(key);
    const qty = Number(d.quantity || 0);
    entry.dishesPrepared += qty;

    if (d.prep_started_at && d.prep_completed_at) {
      const start = new Date(d.prep_started_at);
      const end = new Date(d.prep_completed_at);
      const diffMs = end.getTime() - start.getTime();
      const diffMinutes = diffMs > 0 ? diffMs / (1000 * 60) : 0;
      entry.totalPrepTimeMinutes += diffMinutes;
      entry.prepSamples += 1;
    }
  }

  return Array.from(byChef.values()).map((c) => ({
    ...c,
    averagePreparationTimeMinutes:
      c.prepSamples > 0 ? c.totalPrepTimeMinutes / c.prepSamples : null,
  }));
};

