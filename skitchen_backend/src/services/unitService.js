import { Unit } from "../models/index.js";

export const listUnits = async () => {
  return Unit.findAll({ order: [["name", "ASC"]] });
};

export const getUnit = async (id) => {
  const item = await Unit.findByPk(id);
  if (!item) throw new Error("Unit not found");
  return item;
};

export const createUnit = async (data) => {
  return Unit.create({
    name: data.name,
    description: data.description ?? null,
  });
};

export const updateUnit = async (id, data) => {
  const item = await getUnit(id);
  await item.update({
    name: data.name ?? item.name,
    description: data.description ?? item.description,
  });
  return item;
};

export const deleteUnit = async (id) => {
  const item = await getUnit(id);
  await item.destroy();
  return { id };
};