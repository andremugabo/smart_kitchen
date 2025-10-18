import { ProductType } from "../src/models/index.js";

const types = [
  { name: "Food", description: "All food items" },
  { name: "Drink", description: "Beverages" },
  { name: "Tobacco", description: "Cigarettes and related" },
  { name: "Condiment", description: "Sauces, spices, etc." }
];

export default async function seedProductTypes() {
  try {
    for (const t of types) {
      const [type, created] = await ProductType.findOrCreate({
        where: { name: t.name },
        defaults: t
      });
      if (created) {
        console.log(`✅ Created product type: ${t.name}`);
      } else {
        console.log(`ℹ️  Product type already exists: ${t.name}`);
      }
    }
    console.log("🎉 ProductTypes seeding complete");
  } catch (error) {
    console.error("❌ Error seeding ProductTypes:", error);
    throw error;
  }
}
