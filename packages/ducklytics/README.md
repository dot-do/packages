---
name: ducklytics
version: 0.1.2
description: Analytics SDK and dashboard for DuckDB
license: MIT
repository: "https://github.com/dotdo/duckdb"
homepage: "https://duck.do"
keywords:
  - duckdb
  - analytics
  - dashboard
  - cloudflare
  - workers
  - sdk
downloads:
  monthly: 19
published: "2026-01-23T20:17:20.075Z"
updated: "2026-01-23T20:30:59.136Z"
---

# Ducklytics

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare)](https://workers.cloudflare.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)

A real-time analytics dashboard for DuckDB and DuckTail data visualization, powered by Tinybird and deployed on Cloudflare Workers.

![Ducklytics Dashboard](./app/public/banner.png)

## Overview

Ducklytics is a log exploration and analytics dashboard that provides real-time insights into your application logs. It features a modern, responsive UI built with Next.js and is deployed as a static site served by Cloudflare Workers.

The dashboard connects to [Tinybird](https://tinybird.co) for high-performance analytics queries, enabling you to explore millions of log entries with sub-second response times.

## Features

- **Real-time Log Exploration** - Browse, search, and filter logs with infinite scroll pagination
- **Time Series Visualization** - Interactive charts showing request trends and error rates over time
- **Advanced Filtering** - Filter by environment, service, log level, HTTP method, status code, and request path
- **Full-text Search** - Search through log messages with support for multiple terms using pipe (`|`) separator
- **Date Range Selection** - Quick presets (1h, 24h, 3d, 7d, 30d, 6m) or custom date ranges
- **Log Detail Panel** - Slide-out panel with comprehensive log entry details
- **Sortable Columns** - Sort logs by any column in ascending or descending order
- **Authentication** - Optional OAuth.do integration for user authentication
- **Responsive Design** - Collapsible sidebar for optimal viewing on various screen sizes
- **Dark Theme Support** - Beautiful dark-themed log detail view

## Architecture

```
ducklytics/
├── app/                    # Next.js dashboard application
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # React components
│   │   │   ├── charts/    # Time series visualization
│   │   │   ├── filters/   # Search, date range, refresh
│   │   │   ├── layout/    # Sidebar, TopBar
│   │   │   ├── logs/      # Log table, detail panel
│   │   │   ├── metrics/   # Generic counter filters
│   │   │   └── ui/        # Shared UI components
│   │   └── lib/           # Utilities, types, API clients
│   └── public/            # Static assets
├── worker/                 # Cloudflare Worker
│   ├── worker.ts          # Worker entry point
│   ├── wrangler.toml      # Wrangler configuration
│   └── static/            # Built dashboard output
└── package.json           # Root package scripts
```

### Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Charts**: ECharts with echarts-for-react, @tinybirdco/charts
- **UI Components**: Radix UI primitives, Lucide icons
- **Data Fetching**: @chronark/zod-bird (type-safe Tinybird client)
- **Deployment**: Cloudflare Workers with Static Assets
- **Authentication**: OAuth.do (optional)

## Installation

### Prerequisites

- Node.js 18+
- npm or pnpm
- Cloudflare account (for deployment)
- Tinybird workspace with log data

### Setup

1. **Clone the repository and navigate to the package:**

   ```bash
   cd packages/ducklytics
   ```

2. **Install dependencies:**

   ```bash
   npm install
   cd app && npm install
   ```

3. **Configure environment variables:**

   Copy the example environment file in the `app` directory:

   ```bash
   cp app/.env.example app/.env.local
   ```

   Edit `app/.env.local` with your configuration:

   ```env
   # Tinybird default key for unauthenticated requests
   NEXT_PUBLIC_TINYBIRD_API_KEY=your_tinybird_api_key

   # Tinybird API URL (replace with your Tinybird region host)
   NEXT_PUBLIC_TINYBIRD_API_URL=https://api.tinybird.co

   # Tinybird workspace ID for multi-tenant JWT tokens (optional)
   TINYBIRD_WORKSPACE_ID=

   # Tinybird JWT secret for multi-tenant tokens (optional)
   TINYBIRD_JWT_SECRET=

   # OAuth.do configuration (optional, used for authentication)
   # See https://oauth.do for setup instructions
   ```

## Configuration

### Wrangler Configuration

The `worker/wrangler.toml` file configures the Cloudflare Worker deployment:

```toml
name = "ducklytics"
main = "./worker.ts"
compatibility_date = "2025-01-14"
compatibility_flags = ["nodejs_compat"]

# Static Assets Configuration
[assets]
directory = "./static/ducklytics"
binding = "ASSETS"

# Custom domain routes
[[routes]]
pattern = "ducklytics.workers.do/*"
zone_name = "workers.do"

# Environment-specific configuration
[env.production]
[[env.production.routes]]
pattern = "ducklytics.workers.do/*"
zone_name = "workers.do"

[env.staging]
[[env.staging.routes]]
pattern = "ducklytics-staging.workers.do/*"
zone_name = "workers.do"
```

### Environment Variables (Worker)

Configure these in your Cloudflare Workers dashboard or via `wrangler secret`:

| Variable | Description |
|----------|-------------|
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins (e.g., `https://example.com,https://app.example.com`) |

## Development

### Dashboard Development

Run the Next.js development server with hot reloading:

```bash
npm run dev:dashboard
```

This starts the dashboard at `http://localhost:3000`.

### Worker Development

Build the dashboard first, then run the worker locally:

```bash
npm run build:dashboard
npm run dev
```

This starts the Cloudflare Worker locally using Wrangler, serving the static dashboard.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run the Cloudflare Worker locally |
| `npm run dev:dashboard` | Run Next.js development server |
| `npm run build` | Build the dashboard for production |
| `npm run build:dashboard` | Build the Next.js dashboard |
| `npm run clean` | Remove built static files |
| `npm run deploy` | Build and deploy to Cloudflare Workers |
| `npm run deploy:production` | Build and deploy to production environment |

### Dashboard Scripts (in `app/` directory)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build static export for deployment |
| `npm run start` | Start production server (local testing) |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

## Deployment

### Deploy to Cloudflare Workers

1. **Authenticate with Cloudflare:**

   ```bash
   npx wrangler login
   ```

2. **Deploy:**

   ```bash
   npm run deploy
   ```

   Or for production:

   ```bash
   npm run deploy:production
   ```

The dashboard will be available at your configured route (e.g., `https://ducklytics.workers.do`).

### Custom Domain Setup

To use a custom domain:

1. Add your domain to Cloudflare
2. Update the `routes` in `worker/wrangler.toml`:

   ```toml
   [[routes]]
   pattern = "analytics.yourdomain.com/*"
   zone_name = "yourdomain.com"
   ```

3. Redeploy the worker

## Tinybird Integration

Ducklytics connects to Tinybird for analytics queries. The following pipes are required:

### Required Tinybird Pipes

| Pipe | Purpose |
|------|---------|
| `log_analysis` | Paginated log entries with full filtering |
| `log_explorer` | Optimized pipe for large datasets (10M+ rows) |
| `log_timeseries` | Time series aggregation for charts |
| `generic_counter` | Count aggregations for filter sidebar |

### Log Schema

The dashboard expects logs with the following fields:

```typescript
interface LogEntry {
  request_id: string
  timestamp: string
  request_method: string
  status_code: number
  service: string
  request_path: string
  level: string
  message: string
  user_agent: string
  response_time: number
  environment: string
}
```

### Customization

See the [app/README.md](./app/README.md) for details on customizing the Tinybird integration and adapting the schema to your needs.

## API Endpoints

The worker provides the following API endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check endpoint |
| `/api/health` | GET | API health check |
| `/api` | GET | API information and available endpoints |

All other routes serve the static dashboard.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## Related Projects

- [DuckDB](https://duckdb.org/) - The in-process analytical database
- [DuckTail](../ducktail/) - DuckDB tail/streaming utilities
- [Tinybird](https://tinybird.co/) - Real-time data platform
- [OAuth.do](https://oauth.do/) - OAuth authentication service

## Support

- [GitHub Issues](https://github.com/dotdo/duckdb/issues) - Report bugs or request features
- [Documentation](https://duck.do) - Full documentation
