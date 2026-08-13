export const colors = {
  base: "#FDFEFF", // page background
  surface: "#FFFFFF", // card background
  surface2: "#EAF6FE", // chip / icon-chip background (light blue tint)
  surface3: "#DCEFFB", // tooltip / elevated tint
  border: "#D6E9F5", // hairlines, card borders
  text: "#0B2436", // primary text (dark navy, not pure black)
  muted: "#5B7A90", // secondary text
  faint: "#9BB6C6", // tertiary / IDs / captions
  teal: "#0093DD", // brand primary — kept the `teal` name so every
  primaryLight: "#32AFE7", // component that already imports it just works
  red: "#EF4444",
  amber: "#F5A524",
  sky: "#0EA5E9",
  indigo: "#6366F1",
  violet: "#8B5CF6",
};

export const planColor: Record<string, string> = {
  Standard: "#10B981", // shifted off brand-blue so it doesn't collide with the new primary
  Pro: colors.indigo,
  Enterprise: colors.violet,
};

export const hexToRgba = (hex: string, alpha: number) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const fmt = (n: number) => new Intl.NumberFormat("en-NG").format(n);
export const fmtNaira = (n: number) => `\u20A6${fmt(n)}`;

// Swap these for your loaded font families (e.g. via expo-font) if you have
// Space Grotesk / Inter bundled already — falls back to System cleanly otherwise.
export const fonts = {
  display: undefined as string | undefined, // e.g. "SpaceGrotesk-Bold"
  displaySemibold: undefined as string | undefined, // e.g. "SpaceGrotesk-SemiBold"
  body: undefined as string | undefined, // e.g. "Inter-Regular"
};
