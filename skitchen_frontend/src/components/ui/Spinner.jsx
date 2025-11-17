import React from "react";

export function Spinner({ size = 4, className = "" }) {
  const px = typeof size === "number" ? `${size * 4}px` : size;
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-emerald-400 border-t-transparent ${className}`}
      style={{ width: px, height: px }}
    />
  );
}

export default Spinner;
