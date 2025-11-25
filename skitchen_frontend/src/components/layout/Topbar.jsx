import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Menu } from "lucide-react";
import { Button } from "../../components";
import { logout } from "../../services/authService";
import { fetchSettings } from "../../services/settingsService";

const Topbar = ({ onMenuClick }) => {
  const user = useSelector((state) => state.user.user);
  const [companyName, setCompanyName] = useState("Smart Kitchen");
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSettings();
        if (data) {
          if (data.companyName) setCompanyName(data.companyName);
          if (data.companyLogoUrl) setCompanyLogoUrl(data.companyLogoUrl);
        }
      } catch {
        // ignore settings load error in topbar
      }
    };
    load();
  }, []);

  const handleLogout = () => {
    logout();
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
    <header className="flex items-center justify-between px-4 py-3 border-b border-[#2A2F45] bg-[#000014]/80 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-2 rounded-md hover:bg-[#1A1F2D]"
          onClick={onMenuClick}
          aria-label="Toggle sidebar menu"
        >
          <Menu className="w-5 h-5 text-slate-200" />
        </button>
        <div className="hidden lg:flex items-center gap-2 text-sm text-[#9CA3AF]">
          {companyLogoUrl && (
            <img
              src={companyLogoUrl}
              alt={companyName}
              className="w-6 h-6 rounded-full object-cover border border-slate-700"
            />
          )}
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white">
              {companyName}
            </span>
            <span className="text-[11px] text-[#9CA3AF]">
              {roleLabel && <span className="text-[#00E676] mr-1">{roleLabel}</span>}
              Dashboard
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs">
        {user && (
          <>
            <div className="w-8 h-8 rounded-full bg-[#1A1F2D] flex items-center justify-center overflow-hidden border border-[#2A2F45]">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.username || user.email || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[11px] text-[#9CA3AF] font-semibold">
                  {initials || "U"}
                </span>
              )}
            </div>
            <div className="text-right">
              <div className="font-medium text-white truncate max-w-[140px]">
                {user.username || user.email || "User"}
              </div>
              {roleLabel && (
                <div className="text-[11px] text-[#9CA3AF]">{roleLabel}</div>
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
