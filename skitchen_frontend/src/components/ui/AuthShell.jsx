import React from "react";
import logo from "/logo.png";

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-700 rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Smart Kitchen" className="h-16 mb-3" />
          {title && <h1 className="text-2xl font-semibold">{title}</h1>}
          {subtitle && (
            <p className="text-sm text-slate-300 mt-1 text-center">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export default AuthShell;
