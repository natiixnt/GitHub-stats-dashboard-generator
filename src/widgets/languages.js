const { escapeXml, formatNumber, renderCard } = require("../lib/svg");

function renderLanguageSegments(languages, width) {
  if (!languages.length) {
    return "";
  }

  let offset = 0;
  return languages
    .map((language) => {
      const segmentWidth = Math.max((language.percentage / 100) * width, 3);
      const segment = `<rect x="${offset}" y="0" width="${segmentWidth}" height="16" rx="6" fill="${language.color}" />`;
      offset += segmentWidth;
      return segment;
    })
    .join("");
}

function renderLanguageLegend(languages, theme) {
  return languages
    .slice(0, 6)
    .map((language, index) => {
      const row = Math.floor(index / 2);
      const column = index % 2;
      const x = column * 250;
      const y = row * 30;
      return `
      <g transform="translate(${x} ${y})">
        <circle cx="7" cy="10" r="6" fill="${language.color || theme.accent}" />
        <text class="body" x="20" y="14">${escapeXml(language.name)}</text>
        <text class="muted" x="170" y="14">${language.percentage.toFixed(1)}%</text>
      </g>`;
    })
    .join("");
}

function renderLanguagesWidget(data, theme) {
  const hasData = data.languages.length > 0;
  const topLanguages = data.languages.slice(0, 6);

  return renderCard({
    width: 560,
    height: 240,
    title: `${data.username} · Language Usage`,
    subtitle: `${formatNumber(data.scannedRepositories)} repositories scanned`,
    theme,
    body: hasData
      ? `
      <rect x="0" y="0" width="512" height="16" rx="8" fill="${theme.panel}" stroke="${theme.panelBorder}" />
      <g transform="translate(0 0)">
        ${renderLanguageSegments(topLanguages, 512)}
      </g>
      <text class="muted" x="0" y="38">Share of code bytes across public non-fork repositories.</text>
      <g transform="translate(0 54)">
        ${renderLanguageLegend(topLanguages, theme)}
      </g>
      <text class="muted" x="0" y="140">Total language bytes: ${formatNumber(data.totalBytes)}</text>
    `
      : `
      <text class="body" x="0" y="20">No language usage data was returned for this user.</text>
      <text class="muted" x="0" y="44">Try a user with public repositories and non-empty language stats.</text>
    `
  });
}

module.exports = {
  renderLanguagesWidget
};
