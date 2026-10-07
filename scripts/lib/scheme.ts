export type Scheme = "light" | "dark";

export function normalizeScheme(value: string | null): Scheme | null {
  if (!value) {
    return null;
  }
  if (value === "light" || value === "catppuccin-latte") {
    return "light";
  }
  if (
    value === "dark" ||
    value === "catppuccin-macchiato" ||
    value === "rose-pine" ||
    value === "nord"
  ) {
    return "dark";
  }
  return null;
}
