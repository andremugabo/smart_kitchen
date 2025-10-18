# Smart Kitchen

**Smart Kitchen** is a full-stack web application designed to streamline kitchen operations, menu management, inventory tracking, order processing, and staff workflow. It provides role-based access control for different staff members (Admin, Chef, Manager, Waiter) and supports real-time order and inventory management.

This repository contains both the backend (`skitchen_backend`) and frontend (`skitchen_frontend`) of the application, along with documentation to help developers set up, use, and extend the system.

---

## Table of Contents

* [Features](#features)
* [Repository Structure](#repository-structure)
* [Technologies](#technologies)
* [Installation](#installation)
* [Backend Setup](#backend-setup)
* [Frontend Setup](#frontend-setup)
* [Seeding the Database](#seeding-the-database)
* [Running the Application](#running-the-application)
* [API Documentation](#api-documentation)
* [Database Schema](#database-schema)
* [Contributing](#contributing)
* [License](#license)

---

## Features

* **User Management**: Role-based access for Admin, Chef, Manager, and Waiter.
* **Product & Inventory Management**: Track products, units, categories, purchase history, and current stock.
* **Menu & Recipes**: Create menu items, define recipes, and link ingredients to inventory.
* **Orders & Payments**: Manage orders from creation to completion with detailed order items and payment tracking.
* **Seeding & Syncing**: Preloaded sample data for rapid development/testing.
* **Documentation**: API and database schema included for developers.

---

## Repository Structure

```
smart_kitchen/
│
├─ skitchen_backend/       # Backend server
│  ├─ src/
│  │  ├─ models/           # Sequelize models and relationships
│  │  ├─ controllers/      # Business logic
│  │  ├─ routes/           # Express routes
│  │  ├─ config/           # Database and environment configs
│  │  └─ middlewares/      # Authentication, authorization
│  ├─ seeds/               # Seed files for initial data
│  ├─ server.js            # Backend entry point
│  └─ package.json
│
├─ skitchen_frontend/      # Frontend application
│  ├─ src/
│  │  ├─ components/       # Reusable UI components
│  │  ├─ pages/            # Page views
│  │  ├─ services/         # API calls
│  │  └─ App.js            # Frontend entry point
│  └─ package.json
│
└─ docs/                   # Documentation
   ├─ API.md               # API reference
   ├─ Database.md          # ER diagrams, schema
   └─ README.md            # Project overview
```

---

## Technologies

**Backend:**

* Node.js, Express.js
* Sequelize ORM, PostgreSQL
* bcrypt for password hashing
* dotenv for environment management

**Frontend:**

* React.js
* React Router
* Axios for API requests
* TailwindCSS / Bootstrap for styling (optional)

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/andremugabo/smart_kitchen.git
cd smart_kitchen
```

2. Install dependencies for backend and frontend:

```bash
cd skitchen_backend
npm install
cd ../skitchen_frontend
npm install
```

---

## Backend Setup

1. Copy `.env.example` to `.env` and configure your database credentials:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=skitchen_db
```

2. Run migrations and sync models:

```bash
cd skitchen_backend
npm run seed  # Seeds database with sample data
```

---

## Frontend Setup

1. Navigate to frontend:

```bash
cd skitchen_frontend
```

2. Start the development server:

```bash
npm start
```

3. Open your browser at `http://localhost:3000`.

---

## Seeding the Database

The backend comes with seeders for:

* Units (`Piece`, `Kilogram`, `Gram`, `Liter`, `Milliliter`)
* Product Types (`Food`, `Drink`, `Tobacco`, `Condiment`)
* Menu Categories (`Appetizers`, `Main Course`, `Desserts`, `Beverages`)
* Users (`Admin`, `Chef`, `Manager`, `Waiter`)

Run the seeders with:

```bash
npm run seed
```

---

## Running the Application

**Backend:**

```bash
cd skitchen_backend
npm run dev
```

**Frontend:**

```bash
cd skitchen_frontend
npm start
```

**Access:**

* Frontend: `http://localhost:5173`
* Backend API: `http://localhost:3000/api`

---

## API Documentation

Detailed API endpoints, request examples, and responses are in `docs/API.md`. Key endpoints include:

* `/users` – manage users
* `/products` – manage products and inventory
* `/menus` – manage menus and recipes
* `/orders` – create and track orders
* `/payments` – handle payments

---

## Database Schema

ER diagram, table relationships, and data types are documented in `docs/Database.md`.
The database includes:

* Units, ProductTypes, ProductCategories, Products
* Inventory, PurchaseHistory
* MenuCategories, Menus, Recipes
* Users, Orders, OrderDetails, Payments

---

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m "Add feature"`)
4. Push to your branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

