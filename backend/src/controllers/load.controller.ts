
import type { Request, Response } from "express";

import {
    requestAssignment,
} from "../services/assignment.service.js";

export async function acceptLoad(
    req: Request,
    res: Response
): Promise<void> {
    const shipperOrderId = String(req.params.id);
    const carrierName = req.body?.carrierName;

    if (
        typeof carrierName !== "string" ||
        !carrierName.trim()
    ) {
        res.status(400).json({
            message: "Carrier name is required.",
        });
        return;
    }

    const result = await requestAssignment(
        shipperOrderId,
        carrierName.trim()
    );

    if (!result.success) {
        res.status(result.statusCode).json({
            message: result.message,
        });
        return;
    }

    res.status(202).json(result);
}
