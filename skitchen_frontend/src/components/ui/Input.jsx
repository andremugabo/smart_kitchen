import React from "react";

export function Input({ label, className = "", ...props }) {
  return (
    <div>
      {label && (
        <label className="block text-sm mb-1" htmlFor={props.id}>
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 ${className}`}
        {...props}
      />
    </div>
  );
}

export default Input;
