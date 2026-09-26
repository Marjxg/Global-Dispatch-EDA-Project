
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, RefreshCw } from "lucide-react";

import { useOrders } from "@/hooks/useOrders";
import type { OrderRecord } from "@/services/orderApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const statusStyles: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-700",
    Accepted: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
    Assigned: "bg-blue-100 text-blue-700",
};

const filters = [
    "All",
    "Pending",
    "Accepted",
    "Cancelled",
    "Assigned",
] as const;

function formatPrice(price?: number) {
    if (price === undefined) return "—";

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(price);
}

export default function MyOrders() {
    const { orders, loading, error } = useOrders();

    const [search, setSearch] = useState("");
    const [filter, setFilter] =
        useState<(typeof filters)[number]>("All");
    const [selected, setSelected] =
        useState<OrderRecord | null>(null);

    const filtered = useMemo(() => {
        return orders.filter((record) => {
            const matchesId = record.shipperOrderId
                .toLowerCase()
                .includes(search.trim().toLowerCase());

            return (
                matchesId &&
                (filter === "All" || record.status === filter)
            );
        });
    }, [orders, search, filter]);

    // Consultar la versión más reciente del pedido seleccionado.
    const selectedOrder = selected
        ? orders.find(
            (item) =>
                item.shipperOrderId === selected.shipperOrderId
        ) ?? selected
        : null;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        My Requests
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Track your transportation requests in real time.
                    </p>
                </div>

                <Link
                    to="/orders/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    <Plus size={17} />
                    New Request
                </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                {[
                    ["Total Requests", orders.length],
                    [
                        "Accepted",
                        orders.filter(
                            (item) => item.status === "Accepted"
                        ).length,
                    ],
                    [
                        "Cancelled",
                        orders.filter(
                            (item) => item.status === "Cancelled"
                        ).length,
                    ],
                ].map(([title, value]) => (
                    <Card key={String(title)}>
                        <CardContent>
                            <p className="text-sm text-slate-500">
                                {title}
                            </p>
                            <p className="mt-2 text-3xl font-bold">
                                {value}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardContent className="space-y-5">
                    <div className="flex flex-wrap gap-3">
                        <div className="relative max-w-sm flex-1">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search by order ID..."
                                className="pl-10"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {filters.map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setFilter(status)}
                                    className={`rounded-lg px-3 py-2 text-sm ${filter === status
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-100 text-slate-600"
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading && (
                        <p className="flex items-center gap-2 text-sm text-slate-500">
                            <RefreshCw size={16} className="animate-spin" />
                            Loading requests...
                        </p>
                    )}

                    {error && (
                        <p role="alert" className="text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Route</TableHead>
                                    <TableHead>Pickup</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {filtered.map((record) => {
                                    const order = record.order;
                                    const pickup = order?.stops[0];
                                    const delivery = order?.stops.at(-1);

                                    return (
                                        <TableRow key={record.shipperOrderId}>
                                            <TableCell className="font-semibold">
                                                #{record.shipperOrderId}
                                            </TableCell>

                                            <TableCell>
                                                {pickup && delivery
                                                    ? `${pickup.city}, ${pickup.state} → ${delivery.city}, ${delivery.state}`
                                                    : "Pending details"}
                                            </TableCell>

                                            <TableCell>
                                                {order?.pickupDate ?? "—"}
                                            </TableCell>

                                            <TableCell>
                                                {formatPrice(order?.price)}
                                            </TableCell>

                                            <TableCell>
                                                <Badge
                                                    className={
                                                        statusStyles[record.status] ??
                                                        statusStyles.Pending
                                                    }
                                                >
                                                    {record.status}
                                                </Badge>
                                            </TableCell>

                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelected(record)}
                                                >
                                                    Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>

                        {!loading && filtered.length === 0 && (
                            <p className="py-10 text-center text-sm text-slate-500">
                                No requests found.
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {selectedOrder && (
                <Card className="border-blue-200">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>
                                Request #{selectedOrder.shipperOrderId}
                            </CardTitle>
                            <Button
                                variant="outline"
                                onClick={() => setSelected(null)}
                            >
                                Close
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        <Badge
                            className={
                                statusStyles[selectedOrder.status] ??
                                statusStyles.Pending
                            }
                        >
                            {selectedOrder.status}
                        </Badge>

                        <div>
                            <h3 className="font-semibold">Status Notes</h3>
                            <p className="mt-1 text-sm text-slate-600">
                                {selectedOrder.notes ||
                                    "Awaiting validation."}
                            </p>
                        </div>

                        {selectedOrder.order && (
                            <>
                                <div>
                                    <h3 className="font-semibold">
                                        Transportation
                                    </h3>
                                    <p className="mt-1 text-sm">
                                        Pickup: {selectedOrder.order.pickupDate}
                                    </p>
                                    <p className="text-sm">
                                        Delivery: {selectedOrder.order.deliveryDate}
                                    </p>
                                    <p className="text-sm font-semibold">
                                        {formatPrice(selectedOrder.order.price)}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold">Stops</h3>
                                    {selectedOrder.order.stops.map(
                                        (stop, index) => (
                                            <p key={index} className="mt-1 text-sm">
                                                {index + 1}. {stop.city}, {stop.state}
                                                {" "}({stop.postalCode})
                                            </p>
                                        )
                                    )}
                                </div>

                                <div>
                                    <h3 className="font-semibold">Vehicles</h3>
                                    {selectedOrder.order.vehicles.map(
                                        (vehicle, index) => (
                                            <p key={index} className="mt-1 text-sm">
                                                {vehicle.year} {vehicle.make}
                                                {" "}{vehicle.model}
                                            </p>
                                        )
                                    )}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
