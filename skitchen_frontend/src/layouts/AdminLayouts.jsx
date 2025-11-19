import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar, Topbar } from "../components";

const adminLinks = [
  { label: "Dashboard", path: "/app/admin" },
  { label: "Users", path: "/app/admin/users" },
  { label: "Units", path: "/app/admin/units" },
  { label: "Product Types", path: "/app/admin/product-types" },
  { label: "Product Categories", path: "/app/admin/product-categories" },
  { label: "Products", path: "/app/admin/products" },
  { label: "Purchase History", path: "/app/admin/purchase-history" },
  { label: "Inventory", path: "/app/admin/inventory" },
  { label: "MenuCategories", path: "/app/admin/menu-categories" },
  { label: "Menu", path: "/app/admin/menus" },
  { label: "Recipes", path: "/app/admin/recipes" },
  { label: "Orders", path: "/app/admin/orders" },
  { label: "Payments", path: "/app/admin/payments" },
  { label: "Reports", path: "/app/admin/reports" },
  { label: "Settings", path: "/app/admin/settings" },
];

const AdminLayouts = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      <Sidebar
        brand="Smart Kitchen"
        links={adminLinks}
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

export default AdminLayouts;