
import type { Order } from "../types/order";
import { mockOrders } from "../data/mockOrders";

const STORAGE_KEY = "newcron-demo-orders";
const ASSIGNED_KEY = "newcron-demo-assigned";

export interface AssignedLoad {
  shipperOrderId: string;
  carrierName: string;
  acceptedAt: string;
}

export function getDemoOrders(): Order[] {
  try {
    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    if (!Array.isArray(stored)) {
      return [...mockOrders];
    }

    const savedOrders = stored.filter(
      (item): item is Order =>
        item !== null &&
        typeof item === "object" &&
        typeof item.shipperOrderId === "string" &&
        Array.isArray(item.stops) &&
        Array.isArray(item.vehicles) &&
        ["Pending", "Accepted", "Cancelled", "Assigned"]
          .includes(item.status)
    );

    const savedIds = new Set(
      savedOrders.map((order) => order.shipperOrderId)
    );

    return [
      ...mockOrders.filter(
        (order) => !savedIds.has(order.shipperOrderId)
      ),
      ...savedOrders,
    ];
  } catch {
    return [...mockOrders];
  }
}

export function getAssignedLoads(): AssignedLoad[] {
  try {
    const data = JSON.parse(
      localStorage.getItem(ASSIGNED_KEY) || "[]"
    );

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function acceptDemoLoad(
  shipperOrderId: string,
  carrierName: string
): boolean {
  const orders = getDemoOrders();

  const order = orders.find(
    (item) => item.shipperOrderId === shipperOrderId
  );

  if (!order || order.status !== "Accepted") {
    return false;
  }

  const assigned = getAssignedLoads();

  if (
    assigned.some(
      (item) => item.shipperOrderId === shipperOrderId
    )
  ) {
    return false;
  }

  const updatedOrders = orders.map((item) =>
    item.shipperOrderId === shipperOrderId
      ? {
          ...item,
          status: "Assigned" as const,
          notes: `Load accepted by ${carrierName}.`,
        }
      : item
  );

  const newAssignment: AssignedLoad = {
    shipperOrderId,
    carrierName,
    acceptedAt: new Date().toISOString(),
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedOrders)
  );

  localStorage.setItem(
    ASSIGNED_KEY,
    JSON.stringify([...assigned, newAssignment])
  );

  window.dispatchEvent(new Event("newcron-orders-updated"));

  return true;
}
