
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

import {
    fetchOrders,
    type OrderRecord,
} from "@/services/orderApi";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000";

export function useOrders() {
    const [orders, setOrders] = useState<OrderRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        let active = true;
        let requestId = 0;

        async function loadOrders() {
            const currentRequest = ++requestId;

            try {
                const data = await fetchOrders();

                if (!active || currentRequest !== requestId) {
                    return;
                }

                setOrders(data);
                setError("");
            } catch (err) {
                if (!active || currentRequest !== requestId) {
                    return;
                }

                console.error("Error loading orders:", err);
                setError("Unable to load requests.");
            } finally {
                if (active && currentRequest === requestId) {
                    setLoading(false);
                }
            }
        }

        const socket = io(API_URL, {
            autoConnect: false,
            reconnection: true,
        });

        socket.on("connect", () => {
            console.log("Socket.IO connected:", socket.id);
            setConnected(true);

            // Recuperar cualquier actualización que se haya
            // producido mientras el navegador estaba desconectado.
            void loadOrders();
        });

        socket.on("disconnect", () => {
            setConnected(false);
        });

        socket.on("connect_error", (err) => {
            console.error("Socket.IO connection error:", err);
            setConnected(false);
        });

        socket.on("order:updated", () => {
            void loadOrders();
        });

        // La carga inicial NO debe depender de Socket.IO.
        void loadOrders();

        socket.connect();

        return () => {
            active = false;
            socket.disconnect();
        };
    }, []);

    return {
        orders,
        loading,
        error,
        connected,
    };
}
