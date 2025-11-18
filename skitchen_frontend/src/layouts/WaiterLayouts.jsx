import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar, Topbar } from "../components";

const waiterLinks = [
  { label: "Dashboard", path: "/app/waiter" },
  { label: "Orders", path: "/app/waiter/orders" },
];

const WaiterLayouts = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      <Sidebar
        brand="Smart Kitchen"
        links={waiterLinks}
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

export default WaiterLayouts;