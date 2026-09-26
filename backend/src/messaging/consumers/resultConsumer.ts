
import solace from "solclientjs";
import { orderSchema } from "../../schemas/order.schema.js";
import { getSolaceSession } from "../solaceClient.js";
import {
    updateOrder,
    type OrderStatus,
} from "../../services/orderStore.service.js";
import { emitOrderUpdated } from "../../realtime/socket.js";
import {
    applyValidationResult,
} from "../../repositories/order.repository.js";

interface OrderResult {
    shipperOrderId: string;
    status: "Accepted" | "Cancelled";
    notes: string;
    order?: unknown;
}

function isOrderResult(
    value: unknown
): value is OrderResult {
    if (!value || typeof value !== "object") {
        return false;
    }

    const result = value as Record<string, unknown>;

    return (
        typeof result.shipperOrderId === "string" &&
        ["Accepted", "Cancelled"].includes(
            String(result.status)
        ) &&
        typeof result.notes === "string"
    );
}

export function startResultConsumer(): void {
    const session = getSolaceSession();

    const queueName =
        process.env.SOLACE_RESULTS_QUEUE ||
        "shipment.results";

    const consumer = session.createMessageConsumer({
        queueDescriptor: {
            name: queueName,
            type: solace.QueueType.QUEUE,
        },
        acknowledgeMode:
            solace.MessageConsumerAcknowledgeMode.CLIENT,
    });

    consumer.on(
        solace.MessageConsumerEventName.UP,
        () => {
            console.log(
                `[Solace] Consuming results from ${queueName}`
            );
        }
    );

    consumer.on(
        solace.MessageConsumerEventName.MESSAGE,
        async (message: any) => {
            try {
                const attachment = message.getBinaryAttachment();

                if (typeof attachment !== "string") {
                    throw new Error("Expected a JSON string.");
                }

                const payload: unknown = JSON.parse(attachment);

                if (!isOrderResult(payload)) {
                    throw new Error("Invalid order result.");
                }

                const updated = await applyValidationResult(
                    payload.shipperOrderId,
                    payload.status,
                    payload.notes
                );

                if (!updated) {
                    throw new Error(
                        `Order ${payload.shipperOrderId} not found.`
                    );
                }

                // Notificar únicamente después de guardar en PostgreSQL.
                emitOrderUpdated(updated);

                // Confirmar el mensaje después de la operación en BD.
                message.acknowledge();

                console.log(
                    `[Solace] Order ${updated.shipperOrderId}: ${updated.status}`
                );
            } catch (error) {
                console.error(
                    "[Solace] Failed to persist result:",
                    error
                );

                // No confirmar: el mensaje podrá recuperarse.
            }
        }
    );


    consumer.on(
        solace.MessageConsumerEventName.CONNECT_FAILED_ERROR,
        (event: { infoStr: string }) => {
            console.error(
                "[Solace] Result consumer error:",
                event.infoStr
            );
        }
    );

    consumer.connect();
}
