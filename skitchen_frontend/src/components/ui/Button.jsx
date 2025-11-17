import React from "react";

const baseClasses = "inline-flex items-center justify-center rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 focus:ring-offset-black disabled:opacity-60 disabled:cursor-not-allowed";

const variants = {
  primary:
    "bg-gradient-to-r from-emerald-400 to-orange-400 text-black hover:from-emerald-300 hover:to-orange-300",
  outline:
    "border border-emerald-400 text-emerald-300 bg-transparent hover:bg-emerald-500/10",
  ghost: "text-emerald-300 hover:bg-emerald-500/10",
};

export function Button({
  children,
  className = "",
  variant = "primary",
  type = "button",
  ...props
}) {
  const variantClasses = variants[variant] ?? variants.primary;
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses} px-3 py-2 text-sm ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
