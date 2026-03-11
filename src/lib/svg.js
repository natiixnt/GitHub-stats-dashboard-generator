function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function renderCard({
  width,
  height,
  title,
  subtitle,
  theme,
  body,
  viewBox = null
}) {
  const box = viewBox || `0 0 ${width} ${height}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="${box}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">${escapeXml(subtitle)}</desc>
  <defs>
    <linearGradient id="card-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.gradientStart}" />
      <stop offset="100%" stop-color="${theme.gradientEnd}" />
    </linearGradient>
    <style>
      text {
        font-family: "Avenir Next", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      }
      .title { font-size: 22px; font-weight: 700; fill: ${theme.title}; }
      .subtitle { font-size: 12px; font-weight: 500; fill: ${theme.subtitle}; }
      .label { font-size: 11px; font-weight: 600; fill: ${theme.mutedText}; text-transform: uppercase; letter-spacing: 0.6px; }
      .value { font-size: 21px; font-weight: 700; fill: ${theme.text}; }
      .body { font-size: 13px; font-weight: 500; fill: ${theme.text}; }
      .muted { font-size: 11px; font-weight: 500; fill: ${theme.mutedText}; }
    </style>
  </defs>
  <rect x="0" y="0" width="${width}" height="${height}" rx="20" fill="url(#card-bg)" />
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="19" fill="${theme.cardOverlay}" stroke="${theme.border}" />
  <text class="title" x="24" y="38">${escapeXml(title)}</text>
  <text class="subtitle" x="24" y="58">${escapeXml(subtitle)}</text>
  <g transform="translate(24 78)">
    ${body}
  </g>
</svg>`;
}

function renderErrorCard(message) {
  const safeMessage = escapeXml(message);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="560" height="160" viewBox="0 0 560 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="560" height="160" rx="16" fill="#111827"/>
  <rect x="1" y="1" width="558" height="158" rx="15" fill="#1f2937" stroke="#374151"/>
  <text x="24" y="44" fill="#fca5a5" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="18" font-weight="700">
    github-dashboard
  </text>
  <text x="24" y="72" fill="#e5e7eb" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="13" font-weight="500">
    ${safeMessage}
  </text>
  <text x="24" y="108" fill="#93c5fd" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="12" font-weight="500">
    Add ?username=octocat and configure GITHUB_TOKEN for GraphQL metrics.
  </text>
</svg>`;
}

module.exports = {
  escapeXml,
  formatNumber,
  renderCard,
  renderErrorCard
};
