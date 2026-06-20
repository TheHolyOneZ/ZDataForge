import {
  type ButtonHTMLAttributes,
  type ReactNode,
  forwardRef,
  useState,
} from "react";

type Variant = "secondary" | "primary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
  active?: boolean;
}

const BASE_STYLE: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  height: 28,
  padding: "0 10px",
  borderRadius: 4,
  fontSize: 12,
  fontFamily: "var(--font-sans)",
  fontWeight: 500,
  lineHeight: 1,
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition:
    "background var(--duration-base) var(--ease-out), color var(--duration-base) var(--ease-out), border-color var(--duration-base) var(--ease-out)",
};

function variantStyle(
  variant: Variant,
  hover: boolean,
  active: boolean,
  disabled: boolean,
): React.CSSProperties {
  if (variant === "primary") {
    return {
      background: hover && !disabled ? "var(--color-accent-hover)" : "var(--color-accent)",
      color: "#fff",
      border: "1px solid transparent",
      opacity: disabled ? 0.5 : 1,
    };
  }
  if (variant === "ghost") {
    return {
      background: hover && !disabled ? "var(--color-elevated)" : "transparent",
      color: "var(--color-text-secondary)",
      border: "1px solid transparent",
      opacity: disabled ? 0.5 : 1,
    };
  }

  const isActive = active && !disabled;
  return {
    background:
      isActive
        ? "var(--color-accent-muted)"
        : hover && !disabled
          ? "var(--color-elevated)"
          : "transparent",
    color:
      isActive
        ? "var(--color-text-primary)"
        : hover && !disabled
          ? "var(--color-text-primary)"
          : "var(--color-text-secondary)",
    border: `1px solid ${
      isActive
        ? "var(--color-border-strong)"
        : hover && !disabled
          ? "var(--color-border-strong)"
          : "var(--color-border)"
    }`,
    opacity: disabled ? 0.5 : 1,
  };
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", icon, active = false, children, style, disabled, ...rest },
  ref,
) {
  const [hover, setHover] = useState(false);
  const merged: React.CSSProperties = {
    ...BASE_STYLE,
    ...variantStyle(variant, hover, active, !!disabled),
    ...style,
  };
  return (
    <button
      ref={ref}
      {...rest}
      disabled={disabled}
      onMouseEnter={(e) => {
        setHover(true);
        rest.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setHover(false);
        rest.onMouseLeave?.(e);
      }}
      style={merged}
    >
      {icon}
      {children}
    </button>
  );
});

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  variant?: Variant;
  active?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ icon, variant = "secondary", active = false, style, disabled, ...rest }, ref) {
    const [hover, setHover] = useState(false);
    const merged: React.CSSProperties = {
      ...BASE_STYLE,
      width: 28,
      padding: 0,
      ...variantStyle(variant, hover, active, !!disabled),
      ...style,
    };
    return (
      <button
        ref={ref}
        {...rest}
        disabled={disabled}
        onMouseEnter={(e) => {
          setHover(true);
          rest.onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          setHover(false);
          rest.onMouseLeave?.(e);
        }}
        style={merged}
      >
        {icon}
      </button>
    );
  },
);
