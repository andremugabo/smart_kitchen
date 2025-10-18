import { MenuCategory } from "../src/models/index.js";

const categories = [
  { name: "Appetizers", description: "Starters and light dishes" },
  { name: "Main Course", description: "Main dishes" },
  { name: "Desserts", description: "Sweet dishes" },
  { name: "Beverages", description: "Drinks and cocktails" }
];

export default async function seedMenuCategories() {
  try {
    for (const c of categories) {
      const [category, created] = await MenuCategory.findOrCreate({
        where: { name: c.name },
        defaults: c
      });
      if (created) {
        console.log(`✅ Created category: ${c.name}`);
      } else {
        console.log(`ℹ️  Category already exists: ${c.name}`);
      }
    }
    console.log("🎉 MenuCategories seeding complete");
  } catch (error) {
    console.error("❌ Error seeding MenuCategories:", error);
    throw error;
  }
}
