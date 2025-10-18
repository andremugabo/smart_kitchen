import { Unit } from "../src/models/index.js";

const units = [
  { name: "Piece", description: "Single unit" },
  { name: "Kilogram", description: "Weight in kg" },
  { name: "Gram", description: "Weight in g" },
  { name: "Liter", description: "Volume in liters" },
  { name: "Milliliter", description: "Volume in ml" }
];

export default async function seedUnits() {
  try {
    for (const u of units) {
      const [unit, created] = await Unit.findOrCreate({
        where: { name: u.name },
        defaults: u
      });
      if (created) {
        console.log(`✅ Created unit: ${u.name}`);
      } else {
        console.log(`ℹ️  Unit already exists: ${u.name}`);
      }
    }
    console.log("🎉 Units seeding complete");
  } catch (error) {
    console.error("❌ Error seeding Units:", error);
    throw error;
  }
}
