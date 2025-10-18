import bcrypt from "bcrypt";
import { User } from "../src/models/index.js";

const users = [
  { username: "Admin User", password: "123456", role: "admin", email: "admin@skitchen.com" },
  { username: "Chef User", password: "123456", role: "chef", email: "chef@skitchen.com" },
  { username: "Manager User", password: "123456", role: "manager", email: "manager@skitchen.com" },
  { username: "Waiter User", password: "123456", role: "waiter", email: "waiter@skitchen.com" }
];

export default async function seedUsers() {
  try {
    for (const u of users) {
      const password_hash = await bcrypt.hash(u.password, 10);
      const [user, created] = await User.findOrCreate({
        where: { username: u.username },
        defaults: { ...u, password_hash }
      });
      if (created) {
        console.log(`✅ Created user: ${u.username}`);
      } else {
        console.log(`ℹ️  User already exists: ${u.username}`);
      }
    }
    console.log("🎉 Users seeding complete");
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    throw error;
  }
}
