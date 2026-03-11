const { formatNumber, renderCard } = require("../lib/svg");

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function levelToColor(level, theme) {
  if (level === "FIRST_QUARTILE") {
    return theme.heat1;
  }
  if (level === "SECOND_QUARTILE") {
    return theme.heat2;
  }
  if (level === "THIRD_QUARTILE") {
    return theme.heat3;
  }
  if (level === "FOURTH_QUARTILE") {
    return theme.heat4;
  }

  return theme.heatNone;
}

function toMonthLabel(dateString) {
  const date = new Date(`${dateString}T00:00:00Z`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC"
  });
}

function renderCells(weeks, theme, cellSize, gap) {
  return weeks
    .map((week, weekIndex) =>
      (week.contributionDays || [])
        .map((day, dayIndex) => {
          const x = weekIndex * (cellSize + gap);
          const y = dayIndex * (cellSize + gap);
          return `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" fill="${levelToColor(
            day.contributionLevel,
            theme
          )}" />`;
        })
        .join("")
    )
    .join("");
}

function renderMonthLabels(weeks, cellSize, gap) {
  const labels = [];
  let lastLabel = null;

  weeks.forEach((week, weekIndex) => {
    const firstDayOfMonth = (week.contributionDays || []).find(
      (day) => day.date.slice(-2) === "01"
    );
    if (!firstDayOfMonth) {
      return;
    }

    const monthLabel = toMonthLabel(firstDayOfMonth.date);
    if (monthLabel === lastLabel) {
      return;
    }

    lastLabel = monthLabel;
    const x = weekIndex * (cellSize + gap);
    labels.push(`<text class="muted" x="${x}" y="-8">${monthLabel}</text>`);
  });

  return labels.join("");
}

function renderLegend(theme) {
  return `
    <text class="muted" x="572" y="111">Less</text>
    <rect x="603" y="101" width="10" height="10" rx="2" fill="${theme.heatNone}" />
    <rect x="618" y="101" width="10" height="10" rx="2" fill="${theme.heat1}" />
    <rect x="633" y="101" width="10" height="10" rx="2" fill="${theme.heat2}" />
    <rect x="648" y="101" width="10" height="10" rx="2" fill="${theme.heat3}" />
    <rect x="663" y="101" width="10" height="10" rx="2" fill="${theme.heat4}" />
    <text class="muted" x="678" y="111">More</text>
  `;
}

function renderActivityGraphWidget(data, theme) {
  const weeks = data.calendar.weeks;
  const cellSize = 10;
  const gap = 3;
  const graphWidth = weeks.length * (cellSize + gap);

  const dayLabels = DAY_LABELS.map((day, index) => {
    if (index % 2 === 0) {
      return "";
    }
    const y = index * (cellSize + gap) + 9;
    return `<text class="muted" x="-26" y="${y}">${day}</text>`;
  }).join("");

  return renderCard({
    width: 860,
    height: 230,
    title: `${data.displayName} · Activity Graph`,
    subtitle: `Contribution heatmap for the last 12 months`,
    theme,
    body: `
      <g transform="translate(28 30)">
        ${renderMonthLabels(weeks, cellSize, gap)}
        ${dayLabels}
        ${renderCells(weeks, theme, cellSize, gap)}
      </g>
      ${renderLegend(theme)}
      <text class="muted" x="0" y="112">${formatNumber(
        data.totals.contributions
      )} total contributions</text>
      <text class="muted" x="180" y="112">Grid width: ${graphWidth}px</text>
    `
  });
}

module.exports = {
  renderActivityGraphWidget
};
