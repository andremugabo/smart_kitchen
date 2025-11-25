import React from "react";

const baseClasses = "inline-flex items-center justify-center rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00E676] focus:ring-offset-black disabled:opacity-60 disabled:cursor-not-allowed";

const variants = {
  primary:
    "bg-gradient-to-r from-[#00E676] to-[#FFC107] text-black hover:from-[#00FFAA] hover:to-[#FFC107]",
  outline:
    "border border-[#24FF9E] text-[#24FF9E] bg-transparent hover:bg-[#24FF9E]/10",
  ghost: "text-[#24FF9E] hover:bg-[#24FF9E]/10",
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
