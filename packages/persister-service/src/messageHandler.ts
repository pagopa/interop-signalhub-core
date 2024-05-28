import { SQS } from "signalhub-commons";
import { SignalEvent } from "./models/domain/models.js";
import { storeSignalServiceBuilder } from "./services/storeSignal.service.js";

const storeSignalService = storeSignalServiceBuilder();

export function processMessage(): (message: SQS.Message) => Promise<void> {
  return async (message: SQS.Message): Promise<void> => {
    console.log("message processed:", JSON.parse(message.Body!));

    const signalEvent = SignalEvent.safeParse(JSON.parse(message.Body!));

    if (!signalEvent.success) {
      const invalidEnvVars = signalEvent.error.issues.flatMap(
        (issue) => issue.path
      );

      console.error(
        "Invalid or missing env vars: " + invalidEnvVars.join(", ")
      );
    } else {
      storeSignalService.storeSignal(signalEvent.data);
    }
  };
}
