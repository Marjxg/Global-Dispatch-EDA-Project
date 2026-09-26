
import { z } from "zod";

export const orderSchema = z
    .object({
        shipperOrderId: z.string().min(1, "Order ID is required"),

        pickupDate: z.string().min(1, "Pickup date is required"),

        deliveryDate: z.string().min(1, "Delivery date is required"),

        price: z.coerce.number<number>().positive(
            "Price must be greater than zero"
        ),

        stops: z.array(
            z.object({
                stopNumber: z.number(),
                city: z.string().min(1, "City is required"),
                state: z.string().length(2, "Use a two-letter state code"),
                postalCode: z.string().regex(
                    /^\d{5}(-\d{4})?$/,
                    "Enter a valid US ZIP code"
                ),
            })
        ).min(2, "At least two stops are required"),

        vehicles: z.array(
            z.object({
                year: z.string().regex(/^\d{4}$/, "Enter a valid year"),
                make: z.string().min(1, "Make is required"),
                model: z.string().min(1, "Model is required"),
            })
        ).min(1, "At least one vehicle is required"),

        transportationReleaseNotes: z.string().optional(),
    })
    .refine(
        (data) => data.deliveryDate > data.pickupDate,
        {
            message: "Delivery must be at least one day after pickup",
            path: ["deliveryDate"],
        }
    );

export type OrderFormValues = z.infer<typeof orderSchema>;
