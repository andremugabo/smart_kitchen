import React from "react";

const base = "mb-4 text-sm rounded-md px-3 py-2 border";

const variants = {
  error: "text-red-400 bg-red-950/40 border-red-700",
  success: "text-emerald-400 bg-emerald-950/40 border-emerald-700",
  info: "text-sky-300 bg-sky-950/40 border-sky-700",
};

export function Alert({ variant = "info", className = "", children }) {
  const variantClasses = variants[variant] ?? variants.info;
  if (!children) return null;
  return <div className={`${base} ${variantClasses} ${className}`}>{children}</div>;
}

export default Alert;
