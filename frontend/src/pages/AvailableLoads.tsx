
import { useMemo, useState } from "react";
import {
  MapPin,
  Search,
  Truck,
  LoaderCircle,
} from "lucide-react";

import { useOrders } from "@/hooks/useOrders";
import { acceptLoad } from "@/services/orderApi";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function AvailableLoads() {
  const { orders, loading, error } = useOrders();

  const [search, setSearch] = useState("");
  const [carrierName, setCarrierName] = useState("");
  const [selectedId, setSelectedId] =
    useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  const available = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((record) => {
      if (
        record.status !== "Accepted" ||
        !record.order
      ) {
        return false;
      }

      const searchable = [
        record.shipperOrderId,
        ...record.order.stops.flatMap((stop) => [
          stop.city,
          stop.state,
          stop.postalCode,
        ]),
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [orders, search]);

  async function handleAccept() {
    if (
      !selectedId ||
      !carrierName.trim() ||
      submitting
    ) {
      return;
    }

    setSubmitting(true);
    setFeedback("");

    try {
      await acceptLoad(
        selectedId,
        carrierName.trim()
      );

      setFeedback(
        "Assignment request submitted. Waiting for confirmation."
      );

      setSelectedId(null);
      setCarrierName("");
    } catch (err) {
      setFeedback(
        err instanceof Error
          ? err.message
          : "Unable to accept load."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Available Loads
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Browse and accept available transportation
          requests.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by ID, city, state or ZIP"
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {feedback && (
        <div
          role="status"
          className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800"
        >
          {feedback}
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {loading && (
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <LoaderCircle
            size={17}
            className="animate-spin"
          />
          Loading available loads...
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {available.map((record) => {
          const order = record.order!;

          const origin = order.stops[0];
          const destination =
            order.stops[order.stops.length - 1];

          const isSelected =
            selectedId === record.shipperOrderId;

          return (
            <Card key={record.shipperOrderId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Load #{record.shipperOrderId}
                  </CardTitle>

                  <Badge className="bg-green-100 text-green-700">
                    Accepted
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={19}
                      className="mt-1 text-blue-600"
                    />

                    <div>
                      <p className="text-xs text-slate-500">
                        Pickup
                      </p>

                      <p className="font-semibold">
                        {origin.city}, {origin.state}
                      </p>

                      <p className="text-sm text-slate-500">
                        {origin.postalCode} ·{" "}
                        {order.pickupDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin
                      size={19}
                      className="mt-1 text-green-600"
                    />

                    <div>
                      <p className="text-xs text-slate-500">
                        Delivery
                      </p>

                      <p className="font-semibold">
                        {destination.city},{" "}
                        {destination.state}
                      </p>

                      <p className="text-sm text-slate-500">
                        {destination.postalCode} ·{" "}
                        {order.deliveryDate}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    <p className="text-xs text-slate-500">
                      Vehicles
                    </p>

                    <p className="font-medium">
                      {order.vehicles.length}
                    </p>
                  </div>

                  <p className="text-2xl font-bold text-slate-900">
                    {formatPrice(order.price)}
                  </p>
                </div>

                {isSelected ? (
                  <div className="space-y-3 rounded-xl bg-slate-50 p-4">
                    <label
                      htmlFor={`carrier-${record.shipperOrderId}`}
                      className="text-sm font-medium"
                    >
                      Carrier name
                    </label>

                    <Input
                      id={`carrier-${record.shipperOrderId}`}
                      value={carrierName}
                      onChange={(event) =>
                        setCarrierName(event.target.value)
                      }
                      placeholder="Enter carrier name"
                    />

                    <div className="flex gap-2">
                      <Button
                        onClick={handleAccept}
                        disabled={
                          submitting ||
                          !carrierName.trim()
                        }
                      >
                        {submitting
                          ? "Submitting..."
                          : "Confirm"}
                      </Button>

                      <Button
                        variant="outline"
                        disabled={submitting}
                        onClick={() =>
                          setSelectedId(null)
                        }
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => {
                      setSelectedId(
                        record.shipperOrderId
                      );
                      setFeedback("");
                    }}
                  >
                    <Truck size={17} />
                    Accept Load
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!loading && available.length === 0 && (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <Truck
            size={40}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-4 font-semibold">
            No available loads
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            New loads will appear after validation.
          </p>
        </div>
      )}
    </div>
  );
}
