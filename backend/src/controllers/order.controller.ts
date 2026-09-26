
import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";
import { orderSchema } from "../schemas/order.schema.js";
import {
    createPendingOrder,
    findOrderById,
} from "../repositories/order.repository.js";
import {
    publishOrder,
} from "../messaging/publishers/orderPublisher.js";

export async function createOrder(
    req: Request,
    res: Response
): Promise<void> {
    const body = req.body;

    if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body) ||
        typeof body.shipperOrderId !== "string" ||
        !body.shipperOrderId.trim()
    ) {
        res.status(400).json({
            message: "A valid shipperOrderId is required.",
        });
        return;
    }

    const existing = await findOrderById(
        body.shipperOrderId
    );

    if (existing) {
        res.status(409).json({
            message: "This order ID already exists.",
            order: existing,
        });
        return;
    }

    const parsed = orderSchema.safeParse(body);

    try {
        await createPendingOrder(
            body.shipperOrderId,
            parsed.success ? parsed.data : undefined
        );
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            res.status(409).json({
                message: "This order ID already exists.",
            });
            return;
        }

        console.error("[Database] Failed to create order:", error);

        res.status(500).json({
            message: "Unable to save the request.",
        });
        return;
    }

    try {
        await publishOrder(body);

        res.status(202).json({
            shipperOrderId: body.shipperOrderId,
            status: "Pending",
            message: "Request submitted for validation.",
        });
    } catch (error) {
        console.error(
            "[Solace] Publication not confirmed:",
            error
        );

        res.status(503).json({
            shipperOrderId: body.shipperOrderId,
            message:
                "Publication was not confirmed. Check the order status before retrying.",
        });
    }
}
