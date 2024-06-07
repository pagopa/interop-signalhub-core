import { describe, expect, it } from "vitest";
import { processMessage } from "../src/messageHandler.js";
import { notRecoverableGenericMessageError } from "../src/models/domain/errors.js";
import { parseQueueMessageToSignal } from "../src/models/domain/utils.js";
import { genericLogger } from "signalhub-commons";

describe("Message parser", () => {
  it("should throw an error if message is not a Signal", () => {
    const malformedNotASignalQueueMessage = {
      Body: "Information about current NY Times fiction bestseller for week of 12/11/2016.",
    };
    expect(() =>
      parseQueueMessageToSignal(malformedNotASignalQueueMessage, genericLogger)
    ).toThrowError(
      notRecoverableGenericMessageError(
        "parsingError",
        malformedNotASignalQueueMessage.Body
      )
    );
  });
});
