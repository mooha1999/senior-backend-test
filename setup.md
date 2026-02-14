# Setup

## Prerequisites

- Node.js 22+
- npm
- Docker (optional)

## Local Development

```bash
npm install
npm run dev        # starts with hot reload (tsx)
```

The server runs on `http://localhost:3000`. API docs at `http://localhost:3000/api-docs`.

## Production Build

```bash
npm run build      # compiles TS and resolves path aliases
npm start          # runs compiled JS
```

## Docker

```bash
docker compose up --build       # foreground
docker compose up -d --build    # detached
docker compose down             # stop
```

Runs on port 3000. Health check built in.

## Tests

```bash
npm test            # single run
npm run test:watch  # watch mode
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `JWT_SECRET` | `marketplace-secret-key-change-in-production` | JWT signing secret |
| `JWT_EXPIRES_IN` | `24h` | Token expiration |
| `CACHE_TTL_SECONDS` | `60` | Order cache TTL |
| `PAYMENT_SUCCESS_RATE` | `0.7` | Payment success probability (0-1) |
| `STOCK_SUCCESS_RATE` | `0.8` | Stock check success probability (0-1) |
| `PAYMENT_MAX_RETRIES` | `3` | Payment retry attempts |
| `PAYMENT_RETRY_BASE_DELAY_MS` | `1000` | Base delay between payment retries |

## Seeded Users

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@marketplace.com` | `admin123` |
| Brand 1 | `brand@marketplace.com` | `brand123` |
| Brand 2 | `brand2@marketplace.com` | `brand456` |
| Customer 1 | `customer@marketplace.com` | `customer123` |
| Customer 2 | `customer2@marketplace.com` | `customer456` |
