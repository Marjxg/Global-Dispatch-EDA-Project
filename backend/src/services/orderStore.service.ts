
import type { CreateOrderInput } from "../schemas/order.schema.js";

export type OrderStatus =
  | "Pending"
  | "Accepted"
  | "Cancelled"
  | "Assigned";

export interface StoredOrder {
  shipperOrderId: string;
  status: OrderStatus;
  notes: string;
  order?: CreateOrderInput;
  updatedAt: string;
  carrierName?: string;
  assignedAt?: string;
}

const orders = new Map<string, StoredOrder>();

export function saveOrder(order: StoredOrder): StoredOrder {
  orders.set(order.shipperOrderId, order);
  return order;
}

export function getOrder(
  shipperOrderId: string
): StoredOrder | undefined {
  return orders.get(shipperOrderId);
}

export function getOrders(): StoredOrder[] {
  return [...orders.values()];
}

export function updateOrder(
  shipperOrderId: string,
  changes: Partial<StoredOrder>
): StoredOrder {
  const existing = orders.get(shipperOrderId);

  const updated: StoredOrder = {
    shipperOrderId,
    status: changes.status ?? existing?.status ?? "Pending",
    notes: changes.notes ?? existing?.notes ?? "",
    order: changes.order ?? existing?.order,
    updatedAt: new Date().toISOString(),
    carrierName: changes.carrierName ?? existing?.carrierName,
    assignedAt: changes.assignedAt ?? existing?.assignedAt,
  };

  orders.set(shipperOrderId, updated);

  return updated;
}
