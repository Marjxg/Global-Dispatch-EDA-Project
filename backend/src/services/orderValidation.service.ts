
import { DateTime } from "luxon";
import type { CreateOrderInput } from "../schemas/order.schema.js";

export interface ValidationResult {
  valid: boolean;
  notes: string[];
}

export function validateOrderDates(
  order: CreateOrderInput,
  now?: DateTime
): ValidationResult {
  const timezone =
    process.env.BUSINESS_TIMEZONE || "America/New_York";

  const currentTime = (now || DateTime.now()).setZone(timezone);

  const pickup = DateTime.fromFormat(
    order.pickupDate,
    "yyyy-MM-dd",
    { zone: timezone }
  );

  const delivery = DateTime.fromFormat(
    order.deliveryDate,
    "yyyy-MM-dd",
    { zone: timezone }
  );

  const notes: string[] = [];

  if (
    !pickup.isValid ||
    pickup.toFormat("yyyy-MM-dd") !== order.pickupDate
  ) {
    notes.push("Invalid pickup date.");
  }

  if (
    !delivery.isValid ||
    delivery.toFormat("yyyy-MM-dd") !== order.deliveryDate
  ) {
    notes.push("Invalid delivery date.");
  }

  if (notes.length > 0) {
    return { valid: false, notes };
  }

  const today = currentTime.startOf("day");

  if (pickup < today) {
    notes.push(
      "Pickup date cannot be earlier than the current date."
    );
  }

  if (
    pickup.hasSame(today, "day") &&
    (
      currentTime.hour > 15 ||
      (currentTime.hour === 15 &&
        (currentTime.minute > 0 ||
          currentTime.second > 0 ||
          currentTime.millisecond > 0))
    )
  ) {
    notes.push(
      "Same-day pickup requests must be submitted no later than 3:00 PM."
    );
  }

  if (delivery < pickup.plus({ days: 1 })) {
    notes.push(
      "Delivery date must be at least one day after pickup."
    );
  }

  return {
    valid: notes.length === 0,
    notes,
  };
}
