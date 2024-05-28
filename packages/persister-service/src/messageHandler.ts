import { SQS, logger } from "signalhub-commons";
import { SignalEvent } from "./models/domain/models.js";
import { storeSignalServiceBuilder } from "./services/storeSignal.service.js";

const storeSignalService = storeSignalServiceBuilder();
const loggerInstance = logger({});

export function processMessage(): (message: SQS.Message) => Promise<void> {
  return async (message: SQS.Message): Promise<void> => {
    console.log("message processed:", JSON.parse(message.Body!));

    const signalEvent = SignalEvent.safeParse(JSON.parse(message.Body!));

    if (!signalEvent.success) {
      const invalidSignalEventVars = signalEvent.error.issues.flatMap(
        (issue) => `${issue.path}: ${issue.message}`
      );
      loggerInstance.error(
        "Invalid Signal event: " + invalidSignalEventVars.join(", ")
      );
    } else {
      storeSignalService.storeSignal(signalEvent.data);
    }
  };
}
