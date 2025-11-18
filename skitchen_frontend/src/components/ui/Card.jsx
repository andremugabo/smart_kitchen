import React from "react";

export function Card({ title, children, className = "" }) {
  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-md ${className}`}>
      {title && (
        <h2 className="text-sm font-semibold text-slate-100 mb-3 tracking-wide uppercase">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

export default Card;
