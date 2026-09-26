import { prisma } from "../config/database.js";
import {
    findAllOrders,
    createPendingOrder,
} from "../repositories/order.repository.js";

async function main() {
    const id = `TEST-${Date.now()}`;

    const created = await createPendingOrder(id, {
        shipperOrderId: id,
        pickupDate: "2026-10-05",
        deliveryDate: "2026-10-06",
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
        transportationReleaseNotes: "Test request",
    });

    console.log("Created order:", created);

    const orders = await findAllOrders();

    console.log("Orders in database:", orders.length);
    console.log(
        "Created order found:",
        orders.some(
            (order) => order.shipperOrderId === id
        )
    );
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });