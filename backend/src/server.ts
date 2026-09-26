
import "dotenv/config";
import { createServer } from "node:http";

import app from "./app.js";

import {
  connectSolace,
} from "./messaging/solaceClient.js";

import {
  startOrderConsumer,
} from "./messaging/consumers/orderConsumer.js";

import {
  startResultConsumer,
} from "./messaging/consumers/resultConsumer.js";

import {
  initializeSocket,
} from "./realtime/socket.js";

import {
  initializePublisher,
} from "./messaging/publishers/orderPublisher.js";

import {
  startAssignmentConsumer,
} from "./messaging/consumers/assignmentConsumer.js";

const PORT = Number(process.env.PORT) || 3000;

async function bootstrap() {
  try {
    const httpServer = createServer(app);

    initializeSocket(httpServer);

    await connectSolace();
    initializePublisher();
    startResultConsumer();
    startOrderConsumer();
    startAssignmentConsumer();

    httpServer.listen(PORT, () => {
      console.log(
        `NewCron API running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Failed to start NewCron:",
      error
    );
    process.exit(1);
  }
}

bootstrap();
