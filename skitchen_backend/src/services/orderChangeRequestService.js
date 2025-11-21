import { Order, OrderDetail, Menu, Recipe, Product, OrderChangeRequest } from "../models/index.js";
import { incrementInventory } from "./inventoryService.js";

export const createOrderChangeRequest = async ({ order_id, order_detail_id, type, requested_by, reason }) => {
  if (!order_id || !type || !requested_by) {
    throw new Error("order_id, type and requested_by are required");
  }

  const order = await Order.findByPk(order_id);
  if (!order) throw new Error("Order not found");

  if (order_detail_id) {
    const detail = await OrderDetail.findOne({ where: { id: order_detail_id, order_id } });
    if (!detail) throw new Error("Order detail not found for this order");
  }

  return OrderChangeRequest.create({
    order_id,
    order_detail_id: order_detail_id || null,
    type,
    status: "pending",
    requested_by,
    reason: reason || null,
  });
};

const restoreInventoryForDetail = async (detail, transaction) => {
  const menu = await Menu.findByPk(detail.menu_id, { transaction });
  if (!menu) return;

  const recipes = await Recipe.findAll({
    where: { menu_id: menu.id },
    include: [{ model: Product }],
    transaction,
  });

  const quantity = Number(detail.quantity || 0);
  if (!quantity) return;

  for (const recipe of recipes) {
    const product = recipe.Product;
    if (!product) continue;

    const recipeQty = Number(recipe.quantity_required);
    if (!recipeQty || Number.isNaN(recipeQty)) continue;

    const totalRecipeQty = recipeQty * quantity;
    const conversionFactor = Number(product.conversion_factor || 1);
    const inventoryQty = conversionFactor > 0 ? totalRecipeQty / conversionFactor : totalRecipeQty;

    if (inventoryQty > 0) {
      await incrementInventory(product.id, inventoryQty);
    }
  }
};

export const approveOrderChangeRequest = async ({ request_id, approved_by, response_message }) => {
  const req = await OrderChangeRequest.findByPk(request_id, {
    include: [{ model: Order }, { model: OrderDetail }],
  });
  if (!req) throw new Error("Request not found");
  if (req.status !== "pending") throw new Error("Request already processed");

  const result = await Order.sequelize.transaction(async (t) => {
    const order = await Order.findByPk(req.order_id, {
      include: [{ model: OrderDetail }],
      transaction: t,
    });
    if (!order) throw new Error("Order not found");

    if (req.type === "void_order" || req.type === "cancel_order") {
      const details = order.OrderDetails || [];
      for (const d of details) {
        await restoreInventoryForDetail(d, t);
      }
      await order.update({ status: "canceled", updated_at: new Date() }, { transaction: t });
    } else if (req.type === "remove_item") {
      const detail = await OrderDetail.findOne({ where: { id: req.order_detail_id, order_id: order.id }, transaction: t });
      if (!detail) throw new Error("Order detail not found");

      await restoreInventoryForDetail(detail, t);

      const qty = Number(detail.quantity || 0);
      const price = Number(detail.price_at_time || 0);
      const lineTotal = qty * price;
      const nextTotal = Number(order.total_amount || 0) - lineTotal;
      await order.update({ total_amount: nextTotal }, { transaction: t });
      await detail.destroy({ transaction: t });
    }

    await req.update(
      {
        status: "approved",
        approved_by,
        response_message: response_message || null,
        updated_at: new Date(),
      },
      { transaction: t }
    );

    return { order, request: req };
  });

  return result;
};

export const rejectOrderChangeRequest = async ({ request_id, approved_by, response_message }) => {
  const req = await OrderChangeRequest.findByPk(request_id);
  if (!req) throw new Error("Request not found");
  if (req.status !== "pending") throw new Error("Request already processed");

  await req.update({
    status: "rejected",
    approved_by,
    response_message: response_message || null,
    updated_at: new Date(),
  });

  return req;
};

export const listOrderChangeRequests = async (filter = {}) => {
  const where = {};
  if (filter.status) where.status = filter.status;
  if (filter.type) where.type = filter.type;
  if (filter.order_id) where.order_id = filter.order_id;

  return OrderChangeRequest.findAll({
    where,
    order: [["created_at", "DESC"]],
    include: [Order, OrderDetail],
  });
};
