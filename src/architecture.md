# Architecture

## Overview

Event-driven marketplace backend built with Express 5 and TypeScript. All state is in-memory.

## Directory Layout

```
src/
├── server.ts              # Entry point — starts HTTP server, handles shutdown
├── app.ts                 # App factory — wires all dependencies and returns { app, eventBus }
├── config/                # Environment-based configuration + Swagger/OpenAPI spec
├── types/                 # Shared types (UserRole, JwtPayload, Express augmentation)
├── infra/                 # Infrastructure layer
│   ├── event-bus/         # EventEmitter-based pub/sub with typed events
│   ├── cache/             # In-memory cache with TTL
│   ├── logger/            # Structured JSON logger
│   └── interfaces/        # Contracts for all infra (IEventBus, ICache, ILogger, ITokenProvider)
├── middleware/             # Express middleware
│   ├── auth.middleware     # JWT verification → req.user
│   ├── rbac.middleware     # Role-based access control
│   ├── request-id          # X-Request-ID generation/propagation
│   ├── request-logger      # Request/response logging
│   └── error-handler       # Global error handler (Zod, AppError, 500)
└── services/              # Domain services
    ├── auth/              # Login, user store (seeded), JWT issuance
    ├── orders/            # Order CRUD, cached store (decorator), validation
    ├── payments/          # Payment processing with configurable success rate + retries
    ├── stock/             # Stock verification with configurable success rate
    └── delivery/          # Delivery scheduling
```

## Event Flow

Order creation triggers an asynchronous event chain:

```
POST /orders → order.created
                  ↓
            payment processing (with retries)
              ↓ success              ↓ failure
        payment.success          payment.failed → PAYMENT_FAILED
              ↓
         stock check
           ↓ success              ↓ failure
       stock.updated           stock.failed → STOCK_FAILED
              ↓
       delivery scheduling
              ↓
    delivery.scheduled → COMPLETED
```

Each service listens for its trigger event, does its work, and emits the next event. The order service listens for all status-changing events and updates the order accordingly.

## Key Patterns

- **Dependency injection**: `createApp()` wires everything — no service imports another service directly.
- **Decorator pattern**: `CachedOrderStore` wraps `OrderStore` transparently via the `IOrderStore` interface.
- **Event-driven**: Services communicate through the event bus, not direct calls.
- **Interface segregation**: Each infrastructure component and service has an interface in an `interfaces/` directory.
