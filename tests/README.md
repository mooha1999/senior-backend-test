# Tests

API-level integration tests. Each test boots the full app (Express + event bus + in-memory stores) and interacts only through HTTP requests.

## Structure

```
tests/
├── helpers/
│   ├── create-test-app.ts      # Creates a fresh app instance per test suite
│   ├── wait-for-event.ts       # Awaits terminal events (delivery.scheduled, payment.failed, stock.failed)
│   ├── auth.helpers.ts          # Login helpers that return JWT tokens
│   └── order.helpers.ts         # Order creation + event chain waiting
│
├── health.test.ts               # GET /health
├── auth.test.ts                 # Login, validation, error cases
├── orders-creation.test.ts      # Order validation and response shape
├── event-flow.test.ts           # Happy path: PENDING → COMPLETED
├── event-flow-payment-failure.test.ts  # PENDING → PAYMENT_FAILED
├── event-flow-stock-failure.test.ts    # PENDING → STOCK_FAILED
├── orders-access.test.ts        # RBAC: role-based filtering and access control
└── orders-cache.test.ts         # Cache hit/miss, TTL expiry, invalidation
```

## What is tested

| Suite | Tests | Covers |
|-------|-------|--------|
| health | 1 | Health endpoint |
| auth | 11 | Login (3 roles), JWT format, missing/invalid fields, wrong credentials |
| orders-creation | 15 | Validation errors, 201 response shape, UUID, timestamps |
| event-flow | 6 | Full event chain: payment → stock → delivery → COMPLETED |
| event-flow-payment-failure | 3 | Payment fails → PAYMENT_FAILED |
| event-flow-stock-failure | 3 | Stock fails → STOCK_FAILED |
| orders-access | 18 | Customer isolation, admin sees all, brand sees own products, 401/403 |
| orders-cache | 4 | Cache population, TTL expiry, invalidation on status change |

## How it works

**Controlling async event chains**: When an order is created, the event chain (payment → stock → delivery) runs asynchronously. Tests use `waitForNextTerminalEvent()` to await a terminal event before asserting the final order state.

**Controlling randomness**: Each test file sets `process.env.PAYMENT_SUCCESS_RATE` and `process.env.STOCK_SUCCESS_RATE` at the top before any imports. Vitest runs each file in its own worker, so env vars are isolated. `PAYMENT_RETRY_BASE_DELAY_MS=0` eliminates retry delays.

## Running

```bash
npm test          # single run
npm run test:watch  # watch mode
```
