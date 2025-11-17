import { OrderDetail, Menu } from "../models/index.js";

export const listOrderDetailsByOrder = async (orderId) => {
  return OrderDetail.findAll({
    where: { order_id: orderId },
    include: [{ model: Menu }],
  });
};

export const getOrderDetail = async (id) => {
  const item = await OrderDetail.findByPk(id, { include: [{ model: Menu }] });
  if (!item) throw new Error("OrderDetail not found");
  return item;
};

export const updateOrderDetail = async (id, data) => {
  const item = await getOrderDetail(id);
  await item.update({
    quantity: data.quantity ?? item.quantity,
    kitchen_note: data.kitchen_note ?? item.kitchen_note,
  });
  return item;
};

export const deleteOrderDetail = async (id) => {
  const item = await getOrderDetail(id);
  await item.destroy();
  return { id };
};
