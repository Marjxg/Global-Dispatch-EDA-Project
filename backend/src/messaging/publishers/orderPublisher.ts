
import { randomUUID } from "node:crypto";
import solace from "solclientjs";

import { getSolaceSession } from "../solaceClient.js";

interface PendingPublication {
  resolve: () => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}

const pending = new Map<string, PendingPublication>();

let listenersRegistered = false;

export function initializePublisher(): void {
  if (listenersRegistered) return;

  const session = getSolaceSession();

  session.on(
    solace.SessionEventCode.ACKNOWLEDGED_MESSAGE,
    (event: any) => {
      const id = String(event.correlationKey ?? "");
      const publication = pending.get(id);

      if (!publication) return;

      clearTimeout(publication.timeout);
      pending.delete(id);
      publication.resolve();
    }
  );

  session.on(
    solace.SessionEventCode.REJECTED_MESSAGE_ERROR,
    (event: any) => {
      const id = String(event.correlationKey ?? "");
      const publication = pending.get(id);

      if (!publication) return;

      clearTimeout(publication.timeout);
      pending.delete(id);

      publication.reject(
        new Error(event.infoStr || "Publication rejected")
      );
    }
  );

  listenersRegistered = true;
}

export function publishMessage(
  topic: string,
  payload: unknown
): Promise<void> {
  const session = getSolaceSession();
  const correlationId = randomUUID();

  const message = solace.SolclientFactory.createMessage();

  message.setDestination(
    solace.SolclientFactory.createTopicDestination(topic)
  );

  message.setBinaryAttachment(JSON.stringify(payload));

  message.setDeliveryMode(
    solace.MessageDeliveryModeType.PERSISTENT
  );

  message.setCorrelationKey(correlationId);

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pending.delete(correlationId);

      reject(
        new Error("Solace publication confirmation timed out")
      );
    }, 15000);

    pending.set(correlationId, {
      resolve,
      reject,
      timeout,
    });

    try {
      session.send(message);
    } catch (error) {
      clearTimeout(timeout);
      pending.delete(correlationId);

      reject(
        error instanceof Error
          ? error
          : new Error(String(error))
      );
    }
  });
}

export function publishOrder(
  order: unknown
): Promise<void> {
  return publishMessage(
    process.env.SOLACE_REQUESTS_TOPIC ||
    "shipment/requests",
    order
  );
}

export function publishOrderResult(
  result: unknown
): Promise<void> {
  return publishMessage(
    process.env.SOLACE_RESULTS_TOPIC ||
    "shipment/results",
    result
  );
}

export interface AssignmentRequested {
  assignmentId: string;
  shipperOrderId: string;
  carrierName: string;
  requestedAt: string;
}

export function publishAssignment(
  assignment: AssignmentRequested
): Promise<void> {
  return publishMessage(
    process.env.SOLACE_ASSIGNMENTS_TOPIC ||
      "shipment/assignments",
    assignment
  );
}