import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

let sequelize;

if (process.env.DATABASE_URL) {
  // Render or any cloud hosting
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });

  console.log("🌐 Using Render DATABASE_URL");
} else {
  // Local development
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      dialect: 'postgres',
      port: process.env.DB_PORT || 5432,
      logging: false,
    }
  );

  console.log("💻 Using local database");
}

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connection established');
  } catch (err) {
    console.error('📛 DB connection failed:', err.message);
  }
})();

export default sequelize;
