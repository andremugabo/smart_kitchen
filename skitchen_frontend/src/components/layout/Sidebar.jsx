import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  UtensilsCrossed,
  ShoppingBag,
  Package,
  Bell,
  FileText,
  CreditCard,
  Settings,
  BarChart3,
  User,
  Ruler,
  CookingPot,
} from "lucide-react";

const ICONS = {
  Dashboard: Home,
  Orders: FileText,
  Users: User,
  Units: Ruler,
  Menu: UtensilsCrossed,
  Products: Package,
  Notifications: Bell,
  Reports: BarChart3,
  Payments: CreditCard,
  Settings: Settings,
  Inventory: ShoppingBag,
  Recipes: CookingPot,
};

const Sidebar = ({ brand = "Smart Kitchen", links, open, onClose }) => {
  const location = useLocation();

  const isLinkActive = (linkPath) => {
    if (linkPath === "/app/admin" || linkPath === "/app/manager") {
      return location.pathname === linkPath;
    }
    return location.pathname.startsWith(linkPath);
  };

  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-full bg-[#000014] border-r border-[#2A2F45] text-white shadow-lg z-40 transform transition-transform duration-300 w-64 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-[#2A2F45] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Smart Kitchen" className="h-8 w-8" />
            <span className="text-lg font-semibold tracking-tight">
              {brand}
            </span>
          </div>
          <button
            className="lg:hidden p-1 rounded-md hover:bg-[#1A1F2D]"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <nav className="mt-4 flex-1 overflow-y-auto no-scrollbar">
          <ul className="flex flex-col gap-1 px-3 pb-4">
            {links.map((link) => {
              const Icon = ICONS[link.label] || Home;
              const active = isLinkActive(link.path);

              return (
                <li key={link.path}>
                  <NavLink
                    to={link.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-[#1A1F2D] transition-all relative ${
                      active
                        ? "bg-[#1A1F2D] font-semibold before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[#00E676]"
                        : "text-[#9CA3AF]"
                    }`}
                    onClick={onClose}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="truncate">{link.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-[#2A2F45] text-[11px] text-[#9CA3AF]">
          Smart Kitchen v1.0.0
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 lg:hidden z-30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default Sidebar;
