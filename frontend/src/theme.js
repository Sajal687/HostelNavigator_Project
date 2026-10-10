import { alpha, createTheme } from "@mui/material/styles";

// HostelNavigator design tokens. Use these (via the MUI theme) instead of hardcoded colours.
export const tokens = {
  primary: "#4f46e5", // indigo-600: actions, links, brand
  primaryDark: "#4338ca", // indigo-700: hover
  primaryLight: "#eef2ff", // indigo-50: tinted surfaces
  success: "#10b981", // emerald-500: verified / available / trust
  successDark: "#047857",
  successLight: "#ecfdf5",
  warning: "#f59e0b",
  heading: "#0f172a", // slate-900
  body: "#475569", // slate-600
  caption: "#94a3b8", // slate-400
  border: "#e2e8f0", // slate-200
  background: "#f8fafc", // slate-50
  surfaceMuted: "#f1f5f9", // slate-100
  white: "#ffffff",
};

const shadowSm = "0 1px 2px 0 rgb(15 23 42 / 0.05)";
const shadowMd = "0 4px 6px -1px rgb(15 23 42 / 0.07), 0 2px 4px -2px rgb(15 23 42 / 0.05)";
const shadowLg = "0 10px 15px -3px rgb(15 23 42 / 0.08), 0 4px 6px -4px rgb(15 23 42 / 0.05)";
const shadowXl = "0 20px 25px -5px rgb(15 23 42 / 0.08), 0 8px 10px -6px rgb(15 23 42 / 0.05)";

// MUI expects 25 shadow levels; map them onto four soft steps.
const shadows = [
  "none",
  shadowSm, shadowSm,
  shadowMd, shadowMd, shadowMd,
  ...Array(5).fill(shadowLg),
  ...Array(14).fill(shadowXl),
];

const fontFamily = '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const transition = "all 150ms cubic-bezier(0.4, 0, 0.2, 1)";

const theme = createTheme({
  palette: {
    primary: { main: tokens.primary, dark: tokens.primaryDark, light: "#818cf8", contrastText: tokens.white },
    secondary: { main: tokens.heading, contrastText: tokens.white },
    success: { main: tokens.success, dark: tokens.successDark, light: "#6ee7b7", contrastText: tokens.white },
    warning: { main: tokens.warning, contrastText: tokens.white },
    error: { main: "#ef4444" },
    info: { main: "#0ea5e9" },
    text: { primary: tokens.heading, secondary: tokens.body, disabled: tokens.caption },
    divider: tokens.border,
    background: { default: tokens.background, paper: tokens.white },
    grey: { 50: "#f8fafc", 100: "#f1f5f9", 200: "#e2e8f0", 300: "#cbd5e1", 400: "#94a3b8", 500: "#64748b", 600: "#475569", 700: "#334155", 800: "#1e293b", 900: "#0f172a" },
  },
  shape: { borderRadius: 12 },
  shadows,
  typography: {
    fontFamily,
    h1: { fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.1, color: tokens.heading },
    h2: { fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.15, color: tokens.heading },
    h3: { fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, color: tokens.heading },
    h4: { fontWeight: 700, letterSpacing: "-0.015em", color: tokens.heading },
    h5: { fontWeight: 700, color: tokens.heading },
    h6: { fontWeight: 600, color: tokens.heading },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 600 },
    body1: { color: tokens.body },
    body2: { color: tokens.body },
    caption: { color: tokens.caption },
    overline: { fontWeight: 700, letterSpacing: "0.08em" },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: 0 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: tokens.background,
          color: tokens.body,
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
        "a": { color: tokens.primary },
        "::selection": { backgroundColor: alpha(tokens.primary, 0.15) },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, transition, paddingInline: 16 },
        sizeLarge: { paddingBlock: 10, paddingInline: 22, fontSize: "1rem" },
        contained: {
          "&:hover": { boxShadow: shadowMd, transform: "translateY(-1px)" },
          "&:active": { transform: "translateY(0)" },
        },
        outlined: {
          borderColor: tokens.border,
          color: tokens.heading,
          backgroundColor: tokens.white,
          "&:hover": { borderColor: "#cbd5e1", backgroundColor: tokens.surfaceMuted },
        },
        outlinedPrimary: {
          borderColor: alpha(tokens.primary, 0.4),
          color: tokens.primary,
          "&:hover": { borderColor: tokens.primary, backgroundColor: tokens.primaryLight },
        },
        text: { "&:hover": { backgroundColor: tokens.surfaceMuted } },
      },
    },
    MuiIconButton: { styleOverrides: { root: { transition } } },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 500, transition },
        sizeSmall: { height: 24, fontSize: "0.75rem" },
        outlined: { borderColor: tokens.border, backgroundColor: tokens.white },
        colorSuccess: { backgroundColor: tokens.successLight, color: tokens.successDark, "& .MuiChip-icon": { color: tokens.success } },
        outlinedSuccess: { backgroundColor: tokens.successLight, borderColor: alpha(tokens.success, 0.35), color: tokens.successDark },
        colorPrimary: { backgroundColor: tokens.primaryLight, color: tokens.primaryDark },
        outlinedPrimary: { backgroundColor: tokens.primaryLight, borderColor: alpha(tokens.primary, 0.3), color: tokens.primaryDark },
        colorWarning: { backgroundColor: "#fffbeb", color: "#b45309" },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        rounded: { borderRadius: 16 },
        outlined: { borderColor: tokens.border },
        elevation1: { boxShadow: shadowSm },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { borderRadius: 16, border: `1px solid ${tokens.border}`, boxShadow: shadowSm },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: tokens.white,
          transition,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: tokens.border },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd5e1" },
          "&.Mui-focused": { boxShadow: `0 0 0 4px ${alpha(tokens.primary, 0.12)}` },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: tokens.primary, borderWidth: 1 },
        },
      },
    },
    MuiInputLabel: { styleOverrides: { root: { color: tokens.body } } },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: { backgroundColor: tokens.surfaceMuted, borderRadius: 10, padding: 3, gap: 3 },
        grouped: {
          border: "none !important",
          borderRadius: "8px !important",
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          color: tokens.body,
          paddingInline: 12,
          transition,
          "&.Mui-selected": { backgroundColor: tokens.white, color: tokens.heading, boxShadow: shadowSm },
          "&.Mui-selected:hover": { backgroundColor: tokens.white },
        },
      },
    },
    MuiTabs: { styleOverrides: { indicator: { height: 3, borderRadius: 3 } } },
    MuiTab: { styleOverrides: { root: { textTransform: "none", fontWeight: 600, minHeight: 44 } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 20 } } },
    MuiMenu: { styleOverrides: { paper: { borderRadius: 12, border: `1px solid ${tokens.border}`, boxShadow: shadowLg } } },
    MuiTooltip: { styleOverrides: { tooltip: { backgroundColor: tokens.heading, borderRadius: 8 } } },
    MuiAppBar: { defaultProps: { elevation: 0 } },
    MuiAccordion: {
      defaultProps: { elevation: 0, disableGutters: true },
      styleOverrides: {
        root: {
          border: `1px solid ${tokens.border}`,
          borderRadius: 12,
          "&:before": { display: "none" },
          "&.Mui-expanded": { boxShadow: shadowSm },
        },
      },
    },
    MuiPaginationItem: { styleOverrides: { root: { borderRadius: 8, fontWeight: 600 } } },
    MuiFab: { styleOverrides: { root: { boxShadow: shadowLg } } },
    MuiLink: { defaultProps: { underline: "hover" } },
  },
});

export default theme;
