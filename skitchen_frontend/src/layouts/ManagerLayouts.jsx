import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar, Topbar } from "../components";

const managerLinks = [
  { label: "Dashboard", path: "/app/manager" },
  { label: "Units", path: "/app/manager/units" },
  { label: "Product Types", path: "/app/manager/product-types" },
  { label: "Product Categories", path: "/app/manager/product-categories" },
  { label: "Products", path: "/app/manager/products" },
  { label: "Purchase History", path: "/app/manager/purchase-history" },
  { label: "Inventory", path: "/app/manager/inventory" },
  { label: "Recipes", path: "/app/manager/recipes" },
  { label: "Menu Categories", path: "/app/manager/menu-categories" },
  { label: "Menu", path: "/app/manager/menu" },
  { label: "Orders", path: "/app/manager/orders" },
  { label: "Order change requests", path: "/app/manager/order-change-requests" },
  { label: "Payments", path: "/app/manager/payments" },
  { label: "Reports", path: "/app/manager/reports" },
];

const ManagerLayouts = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      <Sidebar
        brand="Smart Kitchen"
        links={managerLinks}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col ml-0 lg:ml-64">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManagerLayouts;