import { SQS, SignalMessage, logger } from "signalhub-commons";
import { storeSignalServiceBuilder } from "./services/storeSignal.service.js";

const storeSignalService = storeSignalServiceBuilder();
const loggerInstance = logger({});

export function processMessage(): (message: SQS.Message) => Promise<void> {
  return async (message: SQS.Message): Promise<void> => {
    try {
      const signalEvent = SignalMessage.safeParse(JSON.parse(message.Body!));
      loggerInstance.info(
        `Message from queue: ${JSON.stringify(signalEvent.data, null, 2)}`
      );

      if (!signalEvent.success) {
        const invalidSignalEventVars = signalEvent.error.issues.flatMap(
          (issue) => `${issue.path}: ${issue.message}`
        );
        loggerInstance.error(
          "Invalid Signal event: " + invalidSignalEventVars.join(", ")
        );
      } else {
        await storeSignalService.storeSignal(signalEvent.data);
      }
    } catch (error) {
      loggerInstance.error(error);

      throw error;
    }
  };
}
