
import { Router } from "express";
import { createOrder } from "../controllers/order.controller.js";
import {
    findAllOrders,
    findOrderById,
} from "../repositories/order.repository.js";

const router = Router();

router.get("/", async (_req, res) => {
    try {
        const orders = await findAllOrders();
        res.json(orders);
    } catch (error) {
        console.error("[Database] Failed to load orders:", error);

        res.status(500).json({
            message: "Unable to load orders.",
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const order = await findOrderById(
            String(req.params.id)
        );

        if (!order) {
            res.status(404).json({
                message: "Order not found.",
            });
            return;
        }

        res.json(order);
    } catch (error) {
        console.error("[Database] Failed to load order:", error);

        res.status(500).json({
            message: "Unable to load order.",
        });
    }
});

router.post("/", createOrder);

export default router;
