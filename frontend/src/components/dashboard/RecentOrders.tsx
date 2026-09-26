
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Order, OrderStatus } from "@/features/orders/types/order";

interface RecentOrdersProps {
    orders: Order[];
}

const statusStyles: Record<OrderStatus, string> = {
    Pending: "bg-amber-100 text-amber-700",
    Accepted: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
    Assigned: "bg-blue-100 text-blue-700",
};

export default function RecentOrders({
    orders,
}: RecentOrdersProps) {
    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Pickup</TableHead>
                        <TableHead>Delivery</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {orders.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="py-10 text-center text-slate-500">
                                No requests found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        orders.map((order) => {
                            const pickup = order.stops[0];
                            const delivery = order.stops[order.stops.length - 1];

                            return (
                                <TableRow key={order.shipperOrderId}>
                                    <TableCell className="font-semibold">
                                        #{order.shipperOrderId}
                                    </TableCell>

                                    <TableCell>
                                        {pickup?.city}, {pickup?.state}
                                        <span className="mx-2 text-slate-400">→</span>
                                        {delivery?.city}, {delivery?.state}
                                    </TableCell>

                                    <TableCell>{order.pickupDate}</TableCell>
                                    <TableCell>{order.deliveryDate}</TableCell>

                                    <TableCell className="font-semibold">
                                        ${order.price.toLocaleString("en-US")}
                                    </TableCell>

                                    <TableCell>
                                        <Badge className={statusStyles[order.status]}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
