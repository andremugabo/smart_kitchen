import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "../../components";
import { clearUser } from "../../store/userSlice";
import { logout } from "../../services/userService";

const Topbar = ({ onMenuClick }) => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    dispatch(clearUser());
    navigate("/login");
  };

  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "";

  const avatarUrl = (() => {
    if (!user?.image) return "";
    if (user.image.startsWith("http")) return user.image;
    const rawBase = import.meta.env.VITE_API_BASE_URL || "";
    const base = rawBase.endsWith("/api") ? rawBase.slice(0, -4) : rawBase;
    const cleanedPath = user.image.replace(/^\//, "");
    return `${base}/${cleanedPath}`;
  })();

  const initials = (() => {
    const source = user?.username || user?.email || "";
    if (!source) return "";
    const parts = source.split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  })();

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-2 rounded-md hover:bg-slate-800"
          onClick={onMenuClick}
          aria-label="Toggle sidebar menu"
        >
          <Menu className="w-5 h-5 text-slate-200" />
        </button>
        <div className="hidden lg:block text-sm text-slate-300">
          {roleLabel && <span className="font-semibold text-emerald-400 mr-2">{roleLabel}</span>}
          <span className="text-xs text-slate-400">Smart Kitchen Dashboard</span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs">
        {user && (
          <>
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.username || user.email || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[11px] text-slate-300 font-semibold">
                  {initials || "U"}
                </span>
              )}
            </div>
            <div className="text-right">
              <div className="font-medium text-slate-100 truncate max-w-[140px]">
                {user.username || user.email || "User"}
              </div>
              {roleLabel && (
                <div className="text-[11px] text-slate-400">{roleLabel}</div>
              )}
            </div>
          </>
        )}
        <Button
          type="button"
          variant="ghost"
          className="px-2 py-1 text-[11px]"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Topbar;
