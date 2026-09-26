
import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  CheckCircle2,
  Clock3,
  Truck,
  Plus,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import { useOrders } from "@/hooks/useOrders";
import type { OrderRecord } from "@/services/orderApi";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

const statusStyles: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Accepted: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
  Assigned: "bg-blue-100 text-blue-700",
};

function formatRoute(record: OrderRecord) {
  const stops = record.order?.stops;

  if (!stops || stops.length < 2) {
    return "Route unavailable";
  }

  const origin = stops[0];
  const destination = stops[stops.length - 1];

  return `${origin.city}, ${origin.state} → ${destination.city}, ${destination.state}`;
}

function formatPrice(price?: number) {
  if (price === undefined) return "—";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export default function Dashboard() {
  const { orders, loading, error, connected } =
    useOrders();

  const stats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter(
        (order) => order.status === "Pending"
      ).length,
      accepted: orders.filter(
        (order) => order.status === "Accepted"
      ).length,
      assigned: orders.filter(
        (order) => order.status === "Assigned"
      ).length,
    }),
    [orders]
  );

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() -
            new Date(a.updatedAt).getTime()
        )
        .slice(0, 5),
    [orders]
  );

  const cards = [
    {
      title: "Total Requests",
      value: stats.total,
      icon: ClipboardList,
      color: "text-blue-600",
      background: "bg-blue-50",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock3,
      color: "text-amber-600",
      background: "bg-amber-50",
    },
    {
      title: "Accepted",
      value: stats.accepted,
      icon: CheckCircle2,
      color: "text-green-600",
      background: "bg-green-50",
    },
    {
      title: "Assigned",
      value: stats.assigned,
      icon: Truck,
      color: "text-violet-600",
      background: "bg-violet-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Overview of your transportation requests.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${connected
                  ? "bg-green-500"
                  : "bg-amber-500"
                }`}
            />

            <span className="text-xs text-slate-500">
              {connected
                ? "Real-time updates connected"
                : "Real-time updates disconnected"}
            </span>
          </div>
        </div>

        <Link
          to="/orders/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus size={17} />
          New Request
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <RefreshCw
            size={16}
            className="animate-spin"
          />
          Loading dashboard...
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title}>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm text-slate-500">
                    {card.title}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {card.value}
                  </p>
                </div>

                <div
                  className={`rounded-xl p-3 ${card.background}`}
                >
                  <Icon
                    size={23}
                    className={card.color}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Requests</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Latest transportation requests and their
              validation status.
            </p>
          </div>

          <Link
            to="/orders"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all
            <ArrowRight size={16} />
          </Link>
        </CardHeader>

        <CardContent>
          {!loading && recentOrders.length === 0 ? (
            <div className="py-12 text-center">
              <ClipboardList
                size={38}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-semibold text-slate-800">
                No requests yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Create your first transportation request
                to get started.
              </p>

              <Link
                to="/orders/new"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus size={16} />
                Create Request
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentOrders.map((record) => (
                <div
                  key={record.shipperOrderId}
                  className="flex flex-wrap items-center justify-between gap-4 py-4"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      #{record.shipperOrderId}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {formatRoute(record)}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Pickup:{" "}
                      {record.order?.pickupDate ?? "—"}
                    </p>
                  </div>

                  <div className="flex items-center gap-5">
                    <span className="text-sm font-semibold text-slate-800">
                      {formatPrice(
                        record.order?.price
                      )}
                    </span>

                    <Badge
                      className={
                        statusStyles[record.status] ??
                        statusStyles.Pending
                      }
                    >
                      {record.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
