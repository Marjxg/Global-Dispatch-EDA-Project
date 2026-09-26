
import solace from "solclientjs";

import {
    getSolaceSession,
} from "../solaceClient.js";

import {
    completeAssignment,
} from "../../services/assignment.service.js";

import {
    emitOrderUpdated,
} from "../../realtime/socket.js";

interface AssignmentEvent {
    assignmentId: string;
    shipperOrderId: string;
    carrierName: string;
    requestedAt: string;
}

export function startAssignmentConsumer(): void {
    const session = getSolaceSession();

    const queueName =
        process.env.SOLACE_ASSIGNMENTS_QUEUE ||
        "shipment.assignments";

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
                `[Solace] Consuming assignments from ${queueName}`
            );
        }
    );


    consumer.on(
        solace.MessageConsumerEventName.MESSAGE,
        async (message: any) => {
            try {
                const attachment = message.getBinaryAttachment();

                if (typeof attachment !== "string") {
                    throw new Error("Invalid message attachment.");
                }

                const event: AssignmentEvent = JSON.parse(attachment);

                if (
                    !event.assignmentId ||
                    !event.shipperOrderId ||
                    !event.carrierName
                ) {
                    throw new Error("Invalid assignment event.");
                }

                const updated = await completeAssignment(
                    event.shipperOrderId,
                    event.assignmentId,
                    event.carrierName
                );

                if (updated) {
                    emitOrderUpdated(updated);

                    console.log(
                        `[Solace] Load ${event.shipperOrderId} assigned to ${event.carrierName}`
                    );
                }

                // Confirmar después de guardar en PostgreSQL.
                // También confirmamos los eventos ya procesados.
                message.acknowledge();
            } catch (error) {
                console.error(
                    "[Solace] Assignment failed:",
                    error
                );

                // No confirmar el mensaje si falló la operación.
            }
        }
    );


    consumer.on(
        solace.MessageConsumerEventName.CONNECT_FAILED_ERROR,
        (event: { infoStr: string }) => {
            console.error(
                "[Solace] Assignment consumer error:",
                event.infoStr
            );
        }
    );

    consumer.connect();
}
