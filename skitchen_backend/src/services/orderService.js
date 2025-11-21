import { Order, OrderDetail, Menu, Notification, User, Recipe, Product, Payment } from "../models/index.js";
import { decrementInventory } from "./inventoryService.js";
import { Op } from "sequelize";

export const listOrders = async () => {
  return Order.findAll({
    order: [["order_date", "DESC"]],
    include: [
      { model: Payment },
      { model: User },
    ],
  });
};

export const getOrder = async (id) => {
  const item = await Order.findByPk(id, {
    include: [
      {
        model: OrderDetail,
        include: [{ model: Menu }],
      },
      { model: User },
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

      // Create order detail row
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

      // Deduct inventory based on this menu's recipe
      // Note: do not use FOR UPDATE lock on the Product side of an outer join,
      // as some databases (e.g. Postgres) do not allow that. The surrounding
      // transaction is sufficient for consistency here.
      const recipes = await Recipe.findAll({
        where: { menu_id: menu.id },
        include: [{ model: Product }],
        transaction: t,
      });

      for (const recipe of recipes) {
        const product = recipe.Product;
        if (!product) continue;

        const recipeQty = Number(recipe.quantity_required);
        if (!recipeQty || Number.isNaN(recipeQty)) continue;

        const totalRecipeQty = recipeQty * quantity; // quantity required for this order

        // conversion_factor: how many recipe units per inventory unit (purchasing/selling)
        const conversionFactor = Number(product.conversion_factor || 1);
        const inventoryQty = conversionFactor > 0 ? totalRecipeQty / conversionFactor : totalRecipeQty;

        if (inventoryQty > 0) {
          try {
            await decrementInventory(product.id, inventoryQty);
          } catch (e) {
            if (e && (e.message === "Insufficient inventory" || e.message === "Inventory record not found")) {
              throw new Error(`Insufficient inventory for product ${product.name}`);
            }
            throw e;
          }
        }
      }
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

export const addItemsToOrder = async (orderId, items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Items array is required");
  }

  const order = await Order.findByPk(orderId);
  if (!order) throw new Error("Order not found");

  if (
    order.status === "canceled" ||
    order.status === "completed" ||
    order.status === "served"
  ) {
    throw new Error("Cannot add items to a served, completed, or canceled order");
  }

  const menus = await Menu.findAll({
    where: { id: items.map((i) => i.menu_id) },
  });

  if (menus.length === 0) {
    throw new Error("No valid menu items provided");
  }

  let addedTotal = 0;

  await Order.sequelize.transaction(async (t) => {
    for (const item of items) {
      const menu = menus.find((m) => m.id === item.menu_id);
      if (!menu) continue;

      const quantity = Number(item.quantity ?? 1);
      if (!quantity || Number.isNaN(quantity) || quantity <= 0) continue;

      const priceAtTime = Number(menu.price);
      const lineTotal = priceAtTime * quantity;
      addedTotal += lineTotal;

      await OrderDetail.create(
        {
          order_id: order.id,
          menu_id: menu.id,
          quantity,
          price_at_time: priceAtTime,
          kitchen_note: item.kitchen_note ?? null,
        },
        { transaction: t }
      );

      const recipes = await Recipe.findAll({
        where: { menu_id: menu.id },
        include: [{ model: Product }],
        transaction: t,
      });

      for (const recipe of recipes) {
        const product = recipe.Product;
        if (!product) continue;

        const recipeQty = Number(recipe.quantity_required);
        if (!recipeQty || Number.isNaN(recipeQty)) continue;

        const totalRecipeQty = recipeQty * quantity;
        const conversionFactor = Number(product.conversion_factor || 1);
        const inventoryQty =
          conversionFactor > 0 ? totalRecipeQty / conversionFactor : totalRecipeQty;

        if (inventoryQty > 0) {
          try {
            await decrementInventory(product.id, inventoryQty);
          } catch (e) {
            if (
              e &&
              (e.message === "Insufficient inventory" ||
                e.message === "Inventory record not found")
            ) {
              throw new Error(`Insufficient inventory for product ${product.name}`);
            }
            throw e;
          }
        }
      }
    }

    if (addedTotal > 0) {
      const currentTotal = Number(order.total_amount || 0);
      await order.update(
        { total_amount: currentTotal + addedTotal, updated_at: new Date() },
        { transaction: t }
      );
    }
  });

  // Return fresh order with details
  return getOrder(order.id);
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

export const getKitchenOrders = async () => {
  const activeStatuses = ["pending", "preparing"];
  const orders = await Order.findAll({
    where: {
      status: { [Op.in]: activeStatuses },
    },
    order: [["order_date", "ASC"]],
    include: [
      {
        model: OrderDetail,
        include: [{ model: Menu }],
      },
    ],
  });

  return orders.map((o) => ({
    id: o.id,
    tableNumber: o.table_number,
    status: o.status,
    orderDate: o.order_date,
    totalAmount: o.total_amount,
    items: (o.OrderDetails || []).map((d) => ({
      id: d.id,
      menuId: d.menu_id,
      name: d.Menu ? d.Menu.name : null,
      quantity: d.quantity,
      kitchenNote: d.kitchen_note,
    })),
  }));
};

export const getCurrentWaiterOrders = async (userId) => {
  const activeStatuses = ["pending", "preparing"];

  const orders = await Order.findAll({
    where: {
      user_id: userId,
      status: { [Op.in]: activeStatuses },
    },
    order: [["order_date", "ASC"]],
  });

  const tables = new Set();
  for (const o of orders) {
    if (o.table_number) {
      tables.add(o.table_number);
    }
  }

  return {
    stats: {
      tablesAssigned: tables.size,
      openOrdersCount: orders.length,
    },
    openOrders: orders.map((o) => ({
      id: o.id,
      tableNumber: o.table_number,
      status: o.status,
      totalAmount: o.total_amount,
      orderDate: o.order_date,
    })),
  };
};
