import { describe, expect, it } from "vitest";
import { createSignal } from "signalhub-commons-test";
import { recoverableMessageError } from "../src/models/domain/errors.js";
import { processMessageHandler, wrongStoreSignalService } from "./utils.js";

describe("Message handler", () => {
  it("should process a valid message and store it", async () => {
    const signal = createSignal();
    const queueMessage = {
      Body: JSON.stringify(signal),
    };
    await expect(processMessageHandler(queueMessage)).resolves.not.toThrow();
  });
  it("should NOT throw an error if message is not a Signal (NotRecoverableGenericMessageError)", async () => {
    const malformedNotASignalQueueMessage = {
      Body: "Information about current NY Times fiction bestseller for week of 12/11/2016.",
    };
    await expect(
      processMessageHandler(malformedNotASignalQueueMessage)
    ).resolves.not.toThrow();
  });
  it("should NOT throw an error ((NotRecoverableMessageError)) if message is a malformed Signal, with wrong signalType", async () => {
    const malformedSignal = {
      ...createSignal(),
      signalType: "CREATEX",
    };
    const queueMessage = {
      Body: JSON.stringify(malformedSignal),
    };
    await expect(processMessageHandler(queueMessage)).resolves.not.toThrow();
  });
  it("should NOT throw an error (NotRecoverableMessageError) if message is a malformed Signal, with empty eserviceId", async () => {
    const malformedSignal = {
      ...createSignal(),
      eserviceId: "",
    };
    const queueMessage = {
      Body: JSON.stringify(malformedSignal),
    };
    await expect(processMessageHandler(queueMessage)).resolves.not.toThrow();
  });
  it("should throw a RecoverableMessageError for a temporary db error", async () => {
    await expect(
      wrongStoreSignalService.storeSignal(createSignal())
    ).rejects.toThrowError(recoverableMessageError("dbConnection"));
  });
});
