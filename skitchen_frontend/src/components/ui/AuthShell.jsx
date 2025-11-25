import React from "react";
import logo from "/logo.png";

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#000014] via-[#0A0A1E] to-[#000A1E] text-white px-4">
      <div className="w-full max-w-md bg-[#1A1F2D]/90 border border-[#2A2F45] rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Smart Kitchen" className="h-16 mb-3" />
          {title && <h1 className="text-2xl font-semibold">{title}</h1>}
          {subtitle && (
            <p className="text-sm text-[#9CA3AF] mt-1 text-center">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export default AuthShell;
