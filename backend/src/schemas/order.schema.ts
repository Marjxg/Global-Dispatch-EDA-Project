
import { z } from "zod";

const stopSchema = z.object({
    stopNumber: z.number().int().positive(),
    city: z.string().trim().min(1),
    state: z.string().trim().length(2),
    postalCode: z.string().regex(/^\d{5}(-\d{4})?$/),
});

const vehicleSchema = z.object({
    year: z.string().regex(/^\d{4}$/),
    make: z.string().trim().min(1),
    model: z.string().trim().min(1),
});

export const orderSchema = z.object({
    shipperOrderId: z.string().trim().min(1),
    pickupDate: z.string(),
    deliveryDate: z.string(),
    price: z.number().positive(),
    stops: z.array(stopSchema).min(2),
    vehicles: z.array(vehicleSchema).min(1),
    transportationReleaseNotes: z.string().optional(),
}).superRefine((order, ctx) => {
    const numbers = order.stops.map(
        (stop) => stop.stopNumber
    );

    const expected = numbers.every(
        (number, index) => number === index + 1
    );

    if (!expected) {
        ctx.addIssue({
            code: "custom",
            path: ["stops"],
            message: "Stop numbers must be sequential, starting at 1.",
        });
    }
});

export type CreateOrderInput = z.infer<typeof orderSchema>;
