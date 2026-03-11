require("dotenv").config();

const express = require("express");

const { resolveTheme, THEMES } = require("./config/themes");
const { GitHubApiError } = require("./lib/github");
const { InMemoryCache } = require("./lib/cache");
const { renderErrorCard } = require("./lib/svg");
const { getContributionMetrics, getLanguageMetrics } = require("./services/metrics");
const { renderCommitStatsWidget } = require("./widgets/commit-stats");
const { renderLanguagesWidget } = require("./widgets/languages");
const { renderActivityGraphWidget } = require("./widgets/activity-graph");
const { renderStreakWidget } = require("./widgets/streak");

const app = express();
const port = Number(process.env.PORT || 3000);
const cacheTtlSeconds = Number(process.env.CACHE_TTL_SECONDS || 1800);
const cache = new InMemoryCache(cacheTtlSeconds * 1000);

const widgetRegistry = {
  "commit-stats": {
    load: getContributionMetrics,
    render: renderCommitStatsWidget
  },
  "language-usage": {
    load: getLanguageMetrics,
    render: renderLanguagesWidget
  },
  "activity-graph": {
    load: getContributionMetrics,
    render: renderActivityGraphWidget
  },
  streak: {
    load: getContributionMetrics,
    render: renderStreakWidget
  }
};

function normalizeUsername(input) {
  if (!input) {
    return "";
  }

  return input.trim().replace(/^@/, "");
}

function isValidGitHubUsername(username) {
  return /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(username);
}

function sendSvg(res, payload) {
  res.set("Content-Type", "image/svg+xml; charset=utf-8");
  res.set("Cache-Control", `public, max-age=${cacheTtlSeconds}`);
  res.send(payload);
}

app.get("/", (_req, res) => {
  res.json({
    project: "github-dashboard",
    status: "ok",
    endpoints: Object.keys(widgetRegistry).map(
      (widget) => `/api/widgets/${widget}.svg?username=octocat`
    ),
    themes: Object.keys(THEMES)
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/widgets/:widget.svg", async (req, res) => {
  const widgetKey = req.params.widget;
  const widget = widgetRegistry[widgetKey];

  if (!widget) {
    res.status(404).json({
      error: `Unknown widget '${widgetKey}'.`,
      available: Object.keys(widgetRegistry)
    });
    return;
  }

  const username = normalizeUsername(req.query.username);
  if (!username || !isValidGitHubUsername(username)) {
    sendSvg(
      res.status(400),
      renderErrorCard("Invalid or missing username. Use ?username=<github-login>.")
    );
    return;
  }

  const theme = resolveTheme(req.query.theme);
  const cacheKey = `${widgetKey}:${username}:${theme.name}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    sendSvg(res, cached);
    return;
  }

  try {
    const token = process.env.GITHUB_TOKEN || "";
    const widgetData = await widget.load(username, token);
    const svg = widget.render(widgetData, theme);
    cache.set(cacheKey, svg);
    sendSvg(res, svg);
  } catch (error) {
    const message = error instanceof GitHubApiError ? error.message : "Unexpected server error.";
    const conciseMessage = message.length > 120 ? `${message.slice(0, 117)}...` : message;
    sendSvg(res.status(502), renderErrorCard(conciseMessage));
  }
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`github-dashboard listening on http://localhost:${port}`);
  });
}

module.exports = {
  app
};
