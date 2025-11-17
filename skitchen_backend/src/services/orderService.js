import { Order, OrderDetail, Menu, Notification, User } from "../models/index.js";

export const listOrders = async () => {
  return Order.findAll({ order: [["order_date", "DESC"]] });
};

export const getOrder = async (id) => {
  const item = await Order.findByPk(id, {
    include: [
      { model: OrderDetail },
    ],
  });
  if (!item) throw new Error("Order not found");
  return item;
};

export const createOrder = async ({ user_id, table_number, items }) => {
  // items: [{ menu_id, quantity }]
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Order must contain at least one item");
  }

  const menus = await Menu.findAll({
    where: { id: items.map((i) => i.menu_id) },
  });

  if (menus.length !== items.length) {
    throw new Error("One or more menus not found");
  }

  let total = 0;

  const order = await Order.sequelize.transaction(async (t) => {
    const createdOrder = await Order.create(
      {
        user_id,
        table_number: table_number ?? null,
        total_amount: 0,
      },
      { transaction: t }
    );

    for (const item of items) {
      const menu = menus.find((m) => m.id === item.menu_id);
      if (!menu) continue;
      const quantity = Number(item.quantity ?? 1);
      const priceAtTime = Number(menu.price);
      const lineTotal = priceAtTime * quantity;
      total += lineTotal;

      await OrderDetail.create(
        {
          order_id: createdOrder.id,
          menu_id: menu.id,
          quantity,
          price_at_time: priceAtTime,
          kitchen_note: item.kitchen_note ?? null,
        },
        { transaction: t }
      );
    }

    await createdOrder.update({ total_amount: total }, { transaction: t });

    return createdOrder;
  });

  // Create notification for the user (if exists)
  if (user_id) {
    const user = await User.findByPk(user_id);
    if (user) {
      await Notification.create({
        user_id,
        order_id: order.id,
        title: "Order created",
        message: `Your order ${order.id} has been placed with total ${total}`,
        type: "order",
      });
    }
  }

  return order;
};

export const updateOrderStatus = async (id, status) => {
  const order = await getOrder(id);
  await order.update({ status, updated_at: new Date() });

  // Notify user about status change
  if (order.user_id) {
    await Notification.create({
      user_id: order.user_id,
      order_id: order.id,
      title: "Order status updated",
      message: `Order ${order.id} status changed to ${status}`,
      type: "order",
    });
  }

  return order;
};

export const deleteOrder = async (id) => {
  const order = await getOrder(id);
  await OrderDetail.destroy({ where: { order_id: id } });
  await order.destroy();
  return { id };
};
