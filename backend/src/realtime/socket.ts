
import { Server } from "socket.io";
import type { Server as HttpServer } from "node:http";
import type { StoredOrder } from "../services/orderStore.service.js";

let io: Server;

export function initializeSocket(
    httpServer: HttpServer
): Server {
    io = new Server(httpServer, {
        cors: {
            origin:
                process.env.FRONTEND_URL ||
                "http://localhost:5173",
        },
    });

    io.on("connection", (socket) => {
        console.log(
            `[Socket.IO] Client connected: ${socket.id}`
        );

        socket.on("disconnect", () => {
            console.log(
                `[Socket.IO] Client disconnected: ${socket.id}`
            );
        });
    });

    return io;
}

export function emitOrderUpdated(
    order: StoredOrder
): void {
    if (!io) return;

    io.emit("order:updated", order);
}
