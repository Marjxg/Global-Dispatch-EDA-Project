
import { randomUUID } from "node:crypto";
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../config/database.js";
import { findOrderById } from "../repositories/order.repository.js";
import { publishAssignment } from "../messaging/publishers/orderPublisher.js";

export async function requestAssignment(
  shipperOrderId: string,
  carrierName: string
) {
  const order = await prisma.order.findUnique({
    where: { shipperOrderId },
    include: { assignment: true },
  });

  if (!order) {
    return {
      success: false as const,
      statusCode: 404,
      message: "Load not found.",
    };
  }

  if (order.status !== "Accepted" || order.assignment) {
    return {
      success: false as const,
      statusCode: 409,
      message: "This load is no longer available.",
    };
  }

  const assignmentId = randomUUID();

  try {
    // La restricción UNIQUE sobre orderId impide
    // que dos transportistas reserven la misma carga.
    await prisma.assignment.create({
      data: {
        assignmentId,
        orderId: order.id,
        carrierName,
        status: "Pending",
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false as const,
        statusCode: 409,
        message: "This load is no longer available.",
      };
    }

    throw error;
  }

  try {
    await publishAssignment({
      assignmentId,
      shipperOrderId,
      carrierName,
      requestedAt: new Date().toISOString(),
    });

    return {
      success: true as const,
      assignmentId,
      status: "Pending" as const,
      message: "Assignment request submitted.",
    };
  } catch (error) {
    console.error(
      "[Assignment] Publication not confirmed:",
      error
    );

    // No eliminamos la reserva: el evento podría
    // haber llegado a Solace aunque se perdiera el ACK.
    return {
      success: false as const,
      statusCode: 503,
      message:
        "Assignment confirmation is uncertain. Check the load status before retrying.",
    };
  }
}

export async function completeAssignment(
  shipperOrderId: string,
  assignmentId: string,
  carrierName: string
) {
  const changed = await prisma.$transaction(async (tx) => {
    const assignment = await tx.assignment.findUnique({
      where: { assignmentId },
      include: { order: true },
    });

    if (
      !assignment ||
      assignment.order.shipperOrderId !== shipperOrderId ||
      assignment.carrierName !== carrierName
    ) {
      throw new Error("Invalid assignment event.");
    }

    // Solace puede entregar el mismo mensaje más de una vez.
    if (assignment.status === "Assigned") {
      return false;
    }

    if (assignment.order.status !== "Accepted") {
      throw new Error("Load is not available.");
    }

    const assignedAt = new Date();

    await tx.assignment.update({
      where: { assignmentId },
      data: {
        status: "Assigned",
        assignedAt,
      },
    });

    await tx.order.update({
      where: { id: assignment.orderId },
      data: {
        status: "Assigned",
        notes: `Assigned to ${carrierName}.`,
      },
    });

    return true;
  });

  if (!changed) {
    return null;
  }

  return findOrderById(shipperOrderId);
}
