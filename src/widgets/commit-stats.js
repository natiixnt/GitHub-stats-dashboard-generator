const { escapeXml, formatNumber, renderCard } = require("../lib/svg");

function renderCommitStatsWidget(data, theme) {
  const metrics = [
    { label: "Commits", value: data.totals.commits },
    { label: "Pull Requests", value: data.totals.pullRequests },
    { label: "Issues", value: data.totals.issues },
    { label: "Reviews", value: data.totals.reviews }
  ];

  const metricPanels = metrics
    .map((metric, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = column * 254;
      const y = row * 62;

      return `
      <g transform="translate(${x} ${y})">
        <rect width="242" height="50" rx="12" fill="${theme.panel}" stroke="${theme.panelBorder}" />
        <text class="label" x="14" y="19">${escapeXml(metric.label)}</text>
        <text class="value" x="14" y="39">${formatNumber(metric.value)}</text>
      </g>`;
    })
    .join("");

  const topRepos = data.topCommitRepos.length
    ? data.topCommitRepos
        .map(
          (repository, index) => `<text class="body" x="0" y="${20 + index * 18}">
          ${index + 1}. ${escapeXml(repository.name)} · ${formatNumber(repository.commits)} commits
        </text>`
        )
        .join("")
    : '<text class="body" x="0" y="20">No repository commit data available.</text>';

  return renderCard({
    width: 560,
    height: 310,
    title: `${data.displayName} · Commit Stats`,
    subtitle: `From ${data.range.from} to ${data.range.to}`,
    theme,
    body: `
      ${metricPanels}
      <text class="muted" x="0" y="146">Top repositories by commit contributions</text>
      <g transform="translate(0 154)">
        ${topRepos}
      </g>
      <line x1="330" y1="146" x2="512" y2="146" stroke="${theme.panelBorder}" />
      <text class="label" x="330" y="170">Followers</text>
      <text class="value" x="330" y="194">${formatNumber(data.followers)}</text>
      <text class="label" x="330" y="222">Public Repos</text>
      <text class="value" x="330" y="246">${formatNumber(data.publicRepos)}</text>
      <text class="muted" x="330" y="278">Total contributions: ${formatNumber(data.totals.contributions)}</text>
    `
  });
}

module.exports = {
  renderCommitStatsWidget
};
