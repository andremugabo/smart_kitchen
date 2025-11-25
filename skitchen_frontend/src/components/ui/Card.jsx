import React from "react";

export function Card({ title, children, className = "" }) {
  return (
    <div className={`rounded-xl border border-[#2A2F45] bg-[#1A1F2D]/90 p-4 shadow-md ${className}`}>
      {title && (
        <h2 className="text-sm font-semibold text-white mb-3 tracking-wide uppercase">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

export default Card;
