import { sequelize } from "./src/models/index.js";
import seedUnits from "./seeds/seedUnits.js";
import seedProductTypes from "./seeds/seedProductTypes.js";
import seedMenuCategories from "./seeds/seedMenuCategories.js";
import seedUsers from "./seeds/seedUsers.js";

const seedDatabase = async () => {
  try {
    console.log("🛠️  Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.\n");

    console.log("🛠️  Syncing database (force: true)...");
    await sequelize.sync({ force: true }); // drop and recreate tables
    console.log("✅ Database synced successfully.\n");

    console.log("🌱 Seeding Units...");
    await seedUnits();
    console.log("✅ Units seeded\n");

    console.log("🌱 Seeding ProductTypes...");
    await seedProductTypes();
    console.log("✅ ProductTypes seeded\n");

    console.log("🌱 Seeding MenuCategories...");
    await seedMenuCategories();
    console.log("✅ MenuCategories seeded\n");

    console.log("🌱 Seeding Users...");
    await seedUsers();
    console.log("✅ Users seeded\n");

    console.log("🎉 All seeders executed successfully!");
  } catch (error) {
    console.error("❌ Error syncing or seeding database:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log("🔒 Database connection closed.");
    process.exit(0);
  }
};

seedDatabase();
