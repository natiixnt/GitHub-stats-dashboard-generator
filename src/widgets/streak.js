const { formatNumber, renderCard } = require("../lib/svg");

function formatDate(dateString) {
  if (!dateString) {
    return "No activity yet";
  }

  const date = new Date(`${dateString}T00:00:00Z`);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  });
}

function renderStreakWidget(data, theme) {
  const panels = [
    {
      label: "Current Streak",
      value: `${formatNumber(data.streak.current)} days`
    },
    {
      label: "Longest Streak",
      value: `${formatNumber(data.streak.longest)} days`
    },
    {
      label: "Active Days",
      value: `${formatNumber(data.streak.activeDays)} days`
    }
  ];

  const panelMarkup = panels
    .map((panel, index) => {
      const x = index * 171;
      return `
      <g transform="translate(${x} 0)">
        <rect width="160" height="72" rx="14" fill="${theme.panel}" stroke="${theme.panelBorder}" />
        <text class="label" x="12" y="24">${panel.label}</text>
        <text class="value" x="12" y="52">${panel.value}</text>
      </g>`;
    })
    .join("");

  return renderCard({
    width: 560,
    height: 220,
    title: `${data.displayName} · Contribution Streak`,
    subtitle: "Based on daily public contribution activity",
    theme,
    body: `
      ${panelMarkup}
      <text class="muted" x="0" y="102">Last active day: ${formatDate(data.streak.lastActiveDate)}</text>
      <text class="muted" x="0" y="122">Total contributions (12 months): ${formatNumber(
        data.totals.contributions
      )}</text>
      <line x1="0" y1="136" x2="512" y2="136" stroke="${theme.panelBorder}" />
      <text class="body" x="0" y="160">${
        data.streak.current > 0
          ? "Streak is active. Keep shipping."
          : "Streak is paused. Push a commit to restart it."
      }</text>
    `
  });
}

module.exports = {
  renderStreakWidget
};
