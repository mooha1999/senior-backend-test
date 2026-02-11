# Fekra Solutions Hub
## Senior Node.js (Express) Backend Technical Challenge

Thank you for your interest in joining Fekra Solutions Hub.

This challenge evaluates your ability to design and implement a reliable, event-driven backend system using **Node.js and Express**.

---

# ⏳ Time Limit

You have **2 days** to complete this test.

### Submission Steps

1. Fork this repository
2. Complete the implementation
3. Push your solution to your fork
4. Email your GitHub repository link to:

careers@fekracorp.com

Subject:
Senior Node.js Backend Challenge – [Your Name]

---

# 🛠 Technical Requirements (Strict)

You MUST use:

- Node.js
- Express.js
- JavaScript (TypeScript optional)
- REST APIs
- Event-driven communication (can simulate with in-memory event bus)
- Clean modular folder structure

You MUST NOT:

- Use NestJS
- Use heavy frameworks
- Skip error handling
- Skip logging

---

# 📌 Business Scenario

We are building a simplified marketplace backend.

When a customer places an order, multiple services must react:

1. Orders Service → Creates the order
2. Payments Service → Processes payment
3. Stock Service → Updates inventory
4. Delivery Service → Schedules delivery
5. Logger → Logs all events

You must implement this flow.

---

# ✅ QUESTION 1 – Core Implementation

## Step 1 – Order Creation API

Create:

POST /orders

Body:
{
  "customerId": "string",
  "items": [
    { "productId": "string", "quantity": number }
  ]
}

Requirements:

- Validate input
- Generate unique order ID
- Save order in memory (database not required)
- Set initial status = "PENDING"
- Publish event: "order.created"

Return:
201 Created

---

## Step 2 – Event-Driven Flow (Required)

Implement an internal event bus (or real queue if preferred).

When "order.created" is published:

### Payment Service

- Simulate payment (random success/failure)
- If success → publish "payment.success"
- If failure → publish "payment.failed"

If payment fails:
- Order status → "PAYMENT_FAILED"

---

### Stock Service

On "payment.success":

- Simulate stock validation
- If stock ok → publish "stock.updated"
- If stock fails → publish "stock.failed"

If stock fails:
- Order status → "STOCK_FAILED"

---

### Delivery Service

On "stock.updated":

- Publish "delivery.scheduled"
- Update order status → "COMPLETED"

---

### Logging (Mandatory)

All events must be logged clearly in console:

Example:
[EVENT] order.created - OrderID: 123
[EVENT] payment.success - OrderID: 123

---

# 🔁 Failure Handling (Mandatory)

You MUST implement:

- Retry logic (at least 2 retries for payment)
- Idempotency protection (prevent duplicate processing of same event)
- Proper error handling middleware
- Consistent JSON error responses

---

# ✅ QUESTION 2 – Authentication & RBAC

You must implement JWT authentication.

Roles:

- admin
- brand
- customer

---

## Required Endpoints

POST /auth/login  
(Return a signed JWT with role)

---

## Authorization Rules

- Only customer can create orders
- Only admin can view all orders (GET /orders)
- Brand can only view orders related to them (simulate ownership logic)

Unauthorized requests must return:
403 Forbidden

Invalid token must return:
401 Unauthorized

---

# ✅ QUESTION 3 – Caching & Performance

Implement:

GET /orders/:id

Add:

- In-memory caching OR Redis (optional)
- Cache TTL = 60 seconds
- Cache invalidation when order status changes

Log when:
- Response is served from cache
- Response is served from memory store

---

# 📊 Logging & Observability

You must:

- Log every request (method + path)
- Log every event
- Log all errors
- Use structured logging format

Example:
{
  "level": "info",
  "event": "payment.success",
  "orderId": "123"
}

---

# 📌 Evaluation Criteria

We will evaluate:

- Code organization
- Event-driven understanding
- Retry & idempotency implementation
- JWT security implementation
- Clean error handling
- Clear logging
- Production mindset

---

# 📤 Submission Reminder

You have 2 days.

Fork → Implement → Push → Send GitHub link to:

careers@fekracorp.com

Subject:
Senior Node.js Backend Challenge – [Your Name]

Good luck.
