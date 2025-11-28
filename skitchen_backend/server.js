// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import errorHandler from './src/middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Swagger
import setupSwagger from './swagger.js';

// Routes
import userRoutes from './src/routes/userRoutes.js';
import productTypeRoutes from './src/routes/productTypeRoutes.js';
import productCategoryRoutes from './src/routes/productCategoryRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import purchaseHistoryRoutes from './src/routes/purchaseHistoryRoutes.js';
import inventoryRoutes from './src/routes/inventoryRoutes.js';
import unitRoutes from './src/routes/unitRoutes.js';
import menuCategoryRoutes from './src/routes/menuCategoryRoutes.js';
import recipeRoutes from './src/routes/recipeRoutes.js';
import menuRoutes from './src/routes/menuRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import orderDetailRoutes from './src/routes/orderDetailRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import settingsRoutes from './src/routes/settingsRoutes.js';
import orderChangeRequestRoutes from './src/routes/orderChangeRequestRoutes.js';

app.use(express.json());

// Dynamic CORS (Render + Local)
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
}));

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname,'uploads')));

// Swagger docs
setupSwagger(app);

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/product-types', productTypeRoutes);
app.use('/api/product-categories', productCategoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/purchases', purchaseHistoryRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/menu-categories', menuCategoryRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/order-details', orderDetailRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/order-change-requests', orderChangeRequestRoutes);

// Health check
app.get('/', (req, res) => {
    res.send('Smart Kitchen Backend is Healthy !! 💥');
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
);
