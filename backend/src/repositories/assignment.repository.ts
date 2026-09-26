
import { randomUUID } from "node:crypto";
import { prisma } from "../config/database.js";

export async function reserveLoad(
    shipperOrderId: string,
    carrierName: string
) {
    return prisma.$transaction(async (tx) => {
        // Solo una transacción puede reservar esta carga.
        const reserved = await tx.order.updateMany({
            where: {
                shipperOrderId,
                status: "Accepted",
                assignment: { is: null },
            },
            data: {
                // El estado público permanece Accepted hasta
                // que el consumidor confirme la asignación.
                notes: "Assignment reservation in progress.",
            },
        });

        if (reserved.count === 0) {
            return null;
        }

        const order = await tx.order.findUniqueOrThrow({
            where: { shipperOrderId },
        });

        return tx.assignment.create({
            data: {
                assignmentId: randomUUID(),
                orderId: order.id,
                carrierName,
                status: "Pending",
            },
        });
    });
}

export async function confirmAssignment(
    assignmentId: string
) {
    return prisma.$transaction(async (tx) => {
        const assignment = await tx.assignment.findUnique({
            where: { assignmentId },
            include: { order: true },
        });

        if (!assignment) {
            return null;
        }

        if (assignment.status === "Assigned") {
            return assignment;
        }

        const assignedAt = new Date();

        await tx.order.update({
            where: { id: assignment.orderId },
            data: {
                status: "Assigned",
                notes: "Load assigned to carrier.",
            },
        });

        return tx.assignment.update({
            where: { assignmentId },
            data: {
                status: "Assigned",
                assignedAt,
            },
            include: { order: true },
        });
    });
}
