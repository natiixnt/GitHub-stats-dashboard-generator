# github-dashboard

Generate beautiful, embeddable GitHub profile dashboards as SVG widgets.

Built with:
- Node.js
- Express
- GitHub GraphQL API
- SVG string generation

## Features

- Commit stats (commits, PRs, issues, reviews)
- Language usage breakdown
- Activity graph (12-month contribution heatmap)
- Contribution streak (current, longest, active days)
- Theme support (`default`, `sunrise`, `mint`)
- In-memory caching to reduce API pressure

## Quick Start

```bash
npm install
cp .env.example .env
```

Set a GitHub token in `.env`:

```dotenv
GITHUB_TOKEN=ghp_your_github_token_here
```

Run locally:

```bash
npm run dev
```

Server starts on `http://localhost:3000` by default.

## API

Widget endpoint pattern:

```txt
/api/widgets/:widget.svg?username=<github-login>&theme=<theme-name>
```

Available widgets:
- `commit-stats`
- `language-usage`
- `activity-graph`
- `streak`

Example:

```txt
http://localhost:3000/api/widgets/commit-stats.svg?username=octocat&theme=mint
```

## README Embed Examples

Replace `https://your-domain.com` with your deployed URL.

```md
## GitHub Dashboard

![Commit Stats](https://your-domain.com/api/widgets/commit-stats.svg?username=octocat&theme=default)
![Language Usage](https://your-domain.com/api/widgets/language-usage.svg?username=octocat&theme=sunrise)
![Activity Graph](https://your-domain.com/api/widgets/activity-graph.svg?username=octocat&theme=mint)
![Contribution Streak](https://your-domain.com/api/widgets/streak.svg?username=octocat&theme=default)
```

You can also embed with HTML for sizing control:

```html
<img
  src="https://your-domain.com/api/widgets/activity-graph.svg?username=octocat&theme=mint"
  alt="GitHub Activity Graph"
  width="860"
/>
```

## Query Parameters

- `username` (required): GitHub login, e.g. `octocat`
- `theme` (optional): `default`, `sunrise`, `mint`

## Notes

- GraphQL endpoints require `GITHUB_TOKEN`.
- Data is cached in memory for `CACHE_TTL_SECONDS` (default: 1800).
- Widgets return SVG content directly, so they are ready for README embedding.

## Development

```bash
npm start
```

Health check:

```txt
GET /health
```

Project root endpoint:

```txt
GET /
```

## License

MIT (see [LICENSE](./LICENSE))
