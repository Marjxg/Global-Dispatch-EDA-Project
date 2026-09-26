# Global Dispatch — Event-Driven Shipment Management

A full-stack shipment management application built with React, Node.js, Solace PubSub+, PostgreSQL and Prisma.

The application allows shippers to submit vehicle transportation requests and carriers to accept available loads. An event-driven architecture handles order validation and carrier assignments.

## Technologies

- Frontend: React, TypeScript, Vite and Tailwind CSS
- Backend: Node.js, Express and TypeScript
- Event broker: Solace PubSub+
- Database: PostgreSQL and Prisma ORM
- Real-time updates: Socket.IO
- Infrastructure: Docker Compose

## Features

- Create shipment requests with pickup and delivery dates, price, stops and vehicle information.
- Validate shipment dates through asynchronous event processing.
- Track requests with Pending, Accepted, Cancelled and Assigned statuses.
- Display available loads.
- Allow carriers to accept available loads.
- Prevent duplicate assignments.
- Persist orders and assignments in PostgreSQL.
- Display real-time status updates.

## Architecture

The frontend communicates with the Express REST API. The backend publishes events to Solace PubSub+, where dedicated consumers process shipment requests, validation results and carrier assignments.

PostgreSQL stores shipment requests and assignments. Socket.IO notifies the frontend when an order changes.

### Event flow

1. A shipper submits a transportation request.
2. The backend stores the request and publishes an event to `shipment/requests`.
3. The validation consumer checks the request.
4. The consumer publishes the result to `shipment/results`.
5. The result consumer updates the order status in PostgreSQL.
6. Accepted orders become available to carriers.
7. A carrier accepts a load, triggering an event on `shipment/assignments`.
8. The assignment consumer confirms the assignment and updates the order status.

## Solace Configuration

The application uses three durable queues:

| Queue | Topic | Purpose |
|---|---|---|
| shipment.requests | shipment/requests | Incoming shipment requests |
| shipment.results | shipment/results | Validation results |
| shipment.assignments | shipment/assignments | Carrier assignments |

## Getting Started

### Prerequisites

- Node.js
- npm
- Docker and Docker Compose

### 1. Start the infrastructure
From the project root:

```bash
docker compose up -d
```
Configure the three Solace queues and their topic subscriptions if they have not already been created.

### 2. Configure the backend

Create `backend/.env` with the appropriate database, Solace and application settings.

```bash
cd backend
npm install
npx prisma migrate deploy
npx prisma generate
```

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

## Business Rules

- Pickup dates cannot be in the past.
- Same-day pickup requests must be submitted before 3:00 p.m. in the configured business timezone.
- Delivery must be scheduled at least one day after pickup.
- Invalid requests are cancelled with explanatory notes.
- Only accepted and unassigned loads are available to carriers.
- Each load can be assigned to only one carrier.
