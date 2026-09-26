
export type OrderStatus =
    | "Pending"
    | "Accepted"
    | "Cancelled"
    | "Assigned";

export interface Stop {
    stopNumber: number;
    city: string;
    state: string;
    postalCode: string;
}

export interface Vehicle {
    year: string;
    make: string;
    model: string;
}

export interface Order {
    shipperOrderId: string;
    pickupDate: string;
    deliveryDate: string;
    price: number;
    stops: Stop[];
    vehicles: Vehicle[];
    transportationReleaseNotes?: string;
    status: OrderStatus;
    notes?: string;
}
