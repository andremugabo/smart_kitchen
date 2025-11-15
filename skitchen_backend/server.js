// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Swagger setup
import setupSwagger from './swagger.js';

// User routes
import userRoutes from './src/routes/userRoutes.js';
// Product modules routes
import productTypeRoutes from './src/routes/productTypeRoutes.js';
import productCategoryRoutes from './src/routes/productCategoryRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import purchaseHistoryRoutes from './src/routes/purchaseHistoryRoutes.js';
import inventoryRoutes from './src/routes/inventoryRoutes.js';

app.use(express.json());

// Enable CORS for your frontend
app.use(cors({
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true, 
}));

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname,'uploads')));

// Mount Swagger
setupSwagger(app);

// Mount routes
app.use('/users', userRoutes);
app.use('/product-types', productTypeRoutes);
app.use('/product-categories', productCategoryRoutes);
app.use('/products', productRoutes);
app.use('/purchases', purchaseHistoryRoutes);
app.use('/inventory', inventoryRoutes);

// Health check
app.get('/', (req, res) => {
    res.send('Smart Kitchen Backend is Healthy !! 💥');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
