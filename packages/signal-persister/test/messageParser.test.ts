import { createSignal } from "pagopa-signalhub-commons-test";
import { describe, expect, it } from "vitest";

import {
  notRecoverableGenericMessageError,
  notRecoverableMessageError
} from "../src/models/domain/errors.js";
import { parseQueueMessageToSignal } from "../src/models/domain/utils.js";

describe("Message parser", () => {
  it("should throw an error if message is not a Signal", () => {
    const malformedNotASignalQueueMessage = {
      Body: "Information about current NY Times fiction bestseller for week of 12/11/2016."
    };
    expect(() =>
      parseQueueMessageToSignal(malformedNotASignalQueueMessage)
    ).toThrowError(
      notRecoverableGenericMessageError(
        "notValidJsonError",
        malformedNotASignalQueueMessage.Body
      )
    );
  });

  it("should throw an error if message is malformed Signal (wrong signalId)", () => {
    const malformedSignal = {
      ...createSignal(),
      signalId: "WRONG!"
    };
    const malformedSignalQueueMessage = JSON.stringify(malformedSignal);
    expect(() =>
      parseQueueMessageToSignal({
        Body: malformedSignalQueueMessage
      })
    ).toThrowError(
      notRecoverableMessageError(
        "parsingError",
        JSON.parse(malformedSignalQueueMessage)
      )
    );
  });
  it("should throw an error if message is malformed Signal (signalId as string)", () => {
    const malformedSignal = {
      ...createSignal(),
      signalId: "1"
    };
    const malformedSignalQueueMessage = JSON.stringify(malformedSignal);
    expect(() =>
      parseQueueMessageToSignal({
        Body: malformedSignalQueueMessage
      })
    ).toThrowError(
      notRecoverableMessageError(
        "parsingError",
        JSON.parse(malformedSignalQueueMessage)
      )
    );
  });
  it("should throw an error if message is malformed Signal (no  attribute eserviceId)", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { eserviceId, ...malformedSignal } = createSignal();
    const malformedSignalQueueMessage = JSON.stringify(malformedSignal);

    expect(() =>
      parseQueueMessageToSignal({
        Body: malformedSignalQueueMessage
      })
    ).toThrowError(
      notRecoverableMessageError(
        "parsingError",
        JSON.parse(malformedSignalQueueMessage)
      )
    );
  });
  it("should parse message even if message contains an arbitrary attribute", () => {
    const malformedSignal = {
      ...createSignal(),
      arbitrary: "no way!"
    };
    const malformedSignalQueueMessage = JSON.stringify(malformedSignal);
    expect(() =>
      parseQueueMessageToSignal({
        Body: malformedSignalQueueMessage
      })
    ).not.toThrowError();
  });

  it("should parse message to correct type Signal", () => {
    const correctSignalQueueMessage = JSON.stringify(createSignal());
    expect(
      parseQueueMessageToSignal({
        Body: correctSignalQueueMessage
      })
    ).toEqual(JSON.parse(correctSignalQueueMessage));
  });
});
