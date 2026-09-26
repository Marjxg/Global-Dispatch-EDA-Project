
import type { Order } from "../types/order";

export const mockOrders: Order[] = [
    {
        shipperOrderId: "6600111",
        pickupDate: "2026-09-28",
        deliveryDate: "2026-09-29",
        price: 900,
        stops: [
            {
                stopNumber: 1,
                city: "Milford",
                state: "MA",
                postalCode: "01757",
            },
            {
                stopNumber: 2,
                city: "Shippensburg",
                state: "PA",
                postalCode: "17257",
            },
        ],
        vehicles: [
            {
                year: "2010",
                make: "Toyota",
                model: "Corolla",
            },
        ],
        status: "Accepted",
        notes: "Waiting for a carrier to accept the load.",
    },
    {
        shipperOrderId: "7743789",
        pickupDate: "2026-09-20",
        deliveryDate: "2026-09-22",
        price: 650,
        stops: [
            {
                stopNumber: 1,
                city: "Dallas",
                state: "TX",
                postalCode: "75201",
            },
            {
                stopNumber: 2,
                city: "Austin",
                state: "TX",
                postalCode: "73301",
            },
        ],
        vehicles: [
            {
                year: "2022",
                make: "Honda",
                model: "Civic",
            },
        ],
        status: "Cancelled",
        notes: "Pickup date cannot be earlier than the current date.",
    },
];
