export default {
  // -----------------------------------
  // BRAND COLORS
  // -----------------------------------
  primary: "#F5A14B",
  primaryDark: "#F9A350",
  accentTeal: "#33A9A2",
  accentBlue: "#0B2E61",
  accentMint: "#E8F8F7",

  // -----------------------------------
  // PRESSED STATES
  // -----------------------------------
  pressed: {
    primary: "#E38F38", // darker orange
    teal: "#2E908A", // darker teal
    light: "#E5E5E7",
    darkText: "#0A0A0A",
  },

  // -----------------------------------
  // TEXT COLORS
  // -----------------------------------
  textPrimary: "#1E2939",
  textSecondary: "#717182",
  textMuted: "#A4A5A6",

  // -----------------------------------
  // BASE
  // -----------------------------------
  white: "#FFFFFF",
  black: "#000000",

  // -----------------------------------
  // BACKGROUNDS & BORDERS
  // -----------------------------------
  borderLight: "#F3F3F5",
  borderMedium: "#E5E7EB",
  backgroundLight: "#F6F6F6",
  backgroundDark: "#030213",

  // -----------------------------------
  // STATUS COLORS
  // -----------------------------------
  danger: "#FF0000",
  success: "#33A9A2",
  warning: "#F5A14B",

  // -----------------------------------
  // SHADOWS
  // -----------------------------------
  shadowLight: "rgba(0,0,0,0.05)",
  shadowMedium: "rgba(0,0,0,0.1)",

  // -----------------------------------
  // GRADIENTS A–D  (with `as const`)
  // -----------------------------------
  gradients: {
    // A: Registration Background
    registration: {
      start: "#FFF5EE",
      end: "#E8F8F7",
      array: ["#FFF5EE", "#E8F8F7"] as const,
    },

    // B: Multicolor 4-Stop Brand Gradient
    multiColor: {
      stops: [
        { offset: "0%", color: "#F5A14B" },
        { offset: "30%", color: "#F7B366" },
        { offset: "70%", color: "#6BB8B4" },
        { offset: "100%", color: "#33A9A2" },
      ],
      array: ["#F5A14B", "#F7B366", "#6BB8B4", "#33A9A2"] as const,
    },

    // C: Soft Peach → Aqua
    softAqua: {
      start: "#FFF7ED",
      end: "#F0FDFA",
      array: ["#FFF7ED", "#F0FDFA"] as const,
    },

    // D: Strong Brand Gradient (Orange → Teal)
    brandStrong: {
      start: "#F5A14B",
      end: "#33A9A2",
      array: ["#F5A14B", "#33A9A2"] as const,
    },
  },
};
