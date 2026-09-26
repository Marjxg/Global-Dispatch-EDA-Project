
import solace from "solclientjs";

import { getSolaceSession } from "../solaceClient.js";
import { publishOrderResult } from "../publishers/orderPublisher.js";
import { orderSchema } from "../../schemas/order.schema.js";
import { validateOrderDates } from "../../services/orderValidation.service.js";

export function startOrderConsumer(): void {
  const session = getSolaceSession();

  const queueName =
    process.env.SOLACE_REQUESTS_QUEUE || "shipment.requests";

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
      console.log(`[Solace] Consuming from ${queueName}`);
    }
  );

  consumer.on(
    solace.MessageConsumerEventName.CONNECT_FAILED_ERROR,
    (event: { infoStr: string }) => {
      console.error("[Solace] Consumer error:", event.infoStr);
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

        const payload = JSON.parse(attachment);
        const parsed = orderSchema.safeParse(payload);

        let result;

        if (!parsed.success) {
          result = {
            shipperOrderId:
              typeof payload?.shipperOrderId === "string"
                ? payload.shipperOrderId
                : null,
            status: "Cancelled",
            notes: "Invalid request payload.",
            errors: parsed.error.issues.map((issue) => ({
              field: issue.path.join("."),
              message: issue.message,
            })),
          };
        } else {
          const validation = validateOrderDates(parsed.data);

          result = {
            shipperOrderId: parsed.data.shipperOrderId,
            status: validation.valid
              ? "Accepted"
              : "Cancelled",
            notes: validation.valid
              ? "Request validated successfully."
              : validation.notes.join(" "),
            order: parsed.data,
          };
        }

        await publishOrderResult(result);

        // Confirmar la solicitud solo después de que
        // Solace confirme la publicación del resultado.
        message.acknowledge();

        console.log(
          `[Solace] Request processed: ${result.shipperOrderId}`
        );
      } catch (error) {
        console.error(
          "[Solace] Request processing failed:",
          error
        );

        // No confirmar el mensaje si falla el procesamiento.
      }
    }
  );
  
  consumer.connect();
}
