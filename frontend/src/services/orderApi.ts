
import type { Order } from "@/features/orders/types/order";

const API_URL =
    import.meta.env.VITE_API_URL;

export interface OrderRecord {
    shipperOrderId: string;
    status: Order["status"];
    notes: string;
    order?: Omit<Order, "status" | "notes">;
    updatedAt: string;
}

export async function fetchOrders(): Promise<OrderRecord[]> {
    const response = await fetch(
        `${API_URL}/api/orders`
    );

    if (!response.ok) {
        throw new Error(
            "Unable to load transportation requests."
        );
    }

    return response.json();
}

export async function submitOrder(
    order: Omit<Order, "status" | "notes">
) {
    const response = await fetch(
        `${API_URL}/api/orders`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(order),
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Unable to submit request."
        );
    }

    return result;
}

export async function acceptLoad(
    shipperOrderId: string,
    carrierName: string
) {
    const response = await fetch(
        `${API_URL}/api/loads/${encodeURIComponent(
            shipperOrderId
        )}/accept`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ carrierName }),
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Unable to accept load."
        );
    }

    return result;
}