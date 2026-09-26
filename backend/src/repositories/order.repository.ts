
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../config/database.js";
import type { CreateOrderInput } from "../schemas/order.schema.js";

const orderInclude = {
    stops: {
        orderBy: { stopNumber: "asc" as const },
    },
    vehicles: true,
    assignment: true,
};

function toOrderResponse(record: any) {
    return {
        shipperOrderId: record.shipperOrderId,
        status: record.status,
        notes: record.notes,
        updatedAt: record.updatedAt.toISOString(),
        carrierName: record.assignment?.carrierName,
        assignedAt:
            record.assignment?.assignedAt?.toISOString(),
        order:
            record.pickupDate &&
                record.deliveryDate &&
                record.price !== null
                ? {
                    shipperOrderId: record.shipperOrderId,
                    pickupDate: record.pickupDate
                        .toISOString()
                        .slice(0, 10),
                    deliveryDate: record.deliveryDate
                        .toISOString()
                        .slice(0, 10),
                    price: Number(record.price),
                    transportationReleaseNotes:
                        record.transportationReleaseNotes ?? "",
                    stops: record.stops.map((stop: any) => ({
                        stopNumber: stop.stopNumber,
                        city: stop.city,
                        state: stop.state,
                        postalCode: stop.postalCode,
                    })),
                    vehicles: record.vehicles.map(
                        (vehicle: any) => ({
                            year: vehicle.year,
                            make: vehicle.make,
                            model: vehicle.model,
                        })
                    ),
                }
                : undefined,
    };
}

export async function findAllOrders() {
    const records = await prisma.order.findMany({
        include: orderInclude,
        orderBy: { updatedAt: "desc" },
    });

    return records.map(toOrderResponse);
}

export async function findOrderById(
    shipperOrderId: string
) {
    const record = await prisma.order.findUnique({
        where: { shipperOrderId },
        include: orderInclude,
    });

    return record ? toOrderResponse(record) : null;
}

export async function createPendingOrder(
    shipperOrderId: string,
    data?: CreateOrderInput
) {
    const record = await prisma.order.create({
        data: {
            shipperOrderId,
            status: "Pending",
            notes: "Request submitted for validation.",
            ...(data
                ? {
                    pickupDate: new Date(
                        `${data.pickupDate}T00:00:00.000Z`
                    ),
                    deliveryDate: new Date(
                        `${data.deliveryDate}T00:00:00.000Z`
                    ),
                    price: new Prisma.Decimal(data.price),
                    transportationReleaseNotes:
                        data.transportationReleaseNotes ?? "",
                    stops: {
                        create: data.stops.map((stop) => ({
                            stopNumber: stop.stopNumber,
                            city: stop.city,
                            state: stop.state,
                            postalCode: stop.postalCode,
                        })),
                    },
                    vehicles: {
                        create: data.vehicles.map((vehicle) => ({
                            year: vehicle.year,
                            make: vehicle.make,
                            model: vehicle.model,
                        })),
                    },
                }
                : {}),
        },
        include: orderInclude,
    });

    return toOrderResponse(record);
}

export async function saveValidationResult(
    shipperOrderId: string,
    status: "Accepted" | "Cancelled",
    notes: string
) {
    const record = await prisma.order.update({
        where: { shipperOrderId },
        data: { status, notes },
        include: orderInclude,
    });

    return toOrderResponse(record);
}

export async function findAvailableLoads() {
    const records = await prisma.order.findMany({
        where: {
            status: "Accepted",
            assignment: {
                is: null,
            },
        },
        include: orderInclude,
        orderBy: { createdAt: "desc" },
    });

    return records.map(toOrderResponse);
}

export async function applyValidationResult(
    shipperOrderId: string,
    status: "Accepted" | "Cancelled",
    notes: string
) {
    const record = await prisma.order.updateMany({
        where: {
            shipperOrderId,
            status: "Pending",
        },
        data: {
            status,
            notes,
        },
    });

    if (record.count === 0) {
        // El resultado pudo haberse procesado anteriormente.
        // No retrocedemos un pedido Assigned a Accepted.
        return findOrderById(shipperOrderId);
    }

    return findOrderById(shipperOrderId);
}