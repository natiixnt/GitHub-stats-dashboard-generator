const THEMES = {
  default: {
    name: "default",
    gradientStart: "#0f172a",
    gradientEnd: "#1e293b",
    cardOverlay: "#0b122acc",
    border: "#334155",
    title: "#f8fafc",
    subtitle: "#cbd5e1",
    text: "#e2e8f0",
    mutedText: "#94a3b8",
    panel: "#0f172a99",
    panelBorder: "#334155",
    accent: "#38bdf8",
    accentSoft: "#7dd3fc",
    heatNone: "#1e293b",
    heat1: "#0e7490",
    heat2: "#0891b2",
    heat3: "#06b6d4",
    heat4: "#22d3ee"
  },
  sunrise: {
    name: "sunrise",
    gradientStart: "#2b1a0f",
    gradientEnd: "#7c2d12",
    cardOverlay: "#311f1599",
    border: "#9a3412",
    title: "#fff7ed",
    subtitle: "#fed7aa",
    text: "#ffedd5",
    mutedText: "#fdba74",
    panel: "#43140799",
    panelBorder: "#c2410c",
    accent: "#fb923c",
    accentSoft: "#fdba74",
    heatNone: "#431407",
    heat1: "#7c2d12",
    heat2: "#c2410c",
    heat3: "#ea580c",
    heat4: "#fb923c"
  },
  mint: {
    name: "mint",
    gradientStart: "#052e2b",
    gradientEnd: "#115e59",
    cardOverlay: "#022c2299",
    border: "#0f766e",
    title: "#ecfeff",
    subtitle: "#99f6e4",
    text: "#ccfbf1",
    mutedText: "#5eead4",
    panel: "#134e4a99",
    panelBorder: "#0f766e",
    accent: "#2dd4bf",
    accentSoft: "#5eead4",
    heatNone: "#042f2e",
    heat1: "#115e59",
    heat2: "#0f766e",
    heat3: "#0d9488",
    heat4: "#14b8a6"
  }
};

function resolveTheme(themeName) {
  if (!themeName) {
    return THEMES.default;
  }

  return THEMES[themeName] || THEMES.default;
}

module.exports = {
  THEMES,
  resolveTheme
};
