import { describe, expect, it } from "vitest";
import {
  notRecoverableGenericMessageError,
  notRecoverableMessageError,
} from "../src/models/domain/errors.js";
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

  it("should throw an error if message is malformed Signal (wrong signalId)", () => {
    const malformedSignalQueueMessage = `
    {
      "signalId": "WRONG! WRONG! WRONG!",
      "eserviceId": "eservice-id-test",
      "objectId": "object-id-test",
      "objectType": "object-type-test",
      "correlationId": "correlation-id-test-1",
      "signalType": "CREATE"
    }
    `;
    expect(() =>
      parseQueueMessageToSignal(
        {
          Body: malformedSignalQueueMessage,
        },
        genericLogger
      )
    ).toThrowError(
      notRecoverableMessageError(
        "parsingError",
        JSON.parse(malformedSignalQueueMessage)
      )
    );
  });
  it("should throw an error if message is malformed Signal (signalId as string) ", () => {
    const malformedSignalQueueMessage = `
    {
      "signalId": "1",
      "eserviceId": "eservice-id-test",
      "objectId": "object-id-test",
      "objectType": "object-type-test",
      "correlationId": "correlation-id-test-1",
      "signalType": "CREATE"
    }
    `;
    expect(() =>
      parseQueueMessageToSignal(
        {
          Body: malformedSignalQueueMessage,
        },
        genericLogger
      )
    ).toThrowError(
      notRecoverableMessageError(
        "parsingError",
        JSON.parse(malformedSignalQueueMessage)
      )
    );
  });
  it("should throw an error if message is malformed Signal (no  attribute eserviceId)", () => {
    const malformedSignalQueueMessage = `
    {
      "signalId": "1",
      "objectId": "object-id-test",
      "objectType": "object-type-test",
      "correlationId": "correlation-id-test-1",
      "signalType": "CREATE"
    }
    `;
    expect(() =>
      parseQueueMessageToSignal(
        {
          Body: malformedSignalQueueMessage,
        },
        genericLogger
      )
    ).toThrowError(
      notRecoverableMessageError(
        "parsingError",
        JSON.parse(malformedSignalQueueMessage)
      )
    );
  });
  it("should throw an error if message is malformed Signal (adding  arbitrary attribute)", () => {
    const malformedSignalQueueMessage = `
    {
      "signalId": "1",
      "eserviceId": "eservice-id-test",
      "objectId": "object-id-test",
      "objectType": "object-type-test",
      "correlationId": "correlation-id-test-1",
      "signalType": "CREATE",
      "arbitrary": "no way!"
    }
    `;
    expect(() =>
      parseQueueMessageToSignal(
        {
          Body: malformedSignalQueueMessage,
        },
        genericLogger
      )
    ).toThrowError(
      notRecoverableMessageError(
        "parsingError",
        JSON.parse(malformedSignalQueueMessage)
      )
    );
  });

  it("should parse message to correct type Signal", () => {
    const correctSignalQueueMessage = `
    {
      "signalId": 1,
      "eserviceId": "eservice-id-test",
      "objectId": "object-id-test",
      "objectType": "object-type-test",
      "correlationId": "correlation-id-test-1",
      "signalType": "CREATE"
    }
    `;
    expect(
      parseQueueMessageToSignal(
        {
          Body: correctSignalQueueMessage,
        },
        genericLogger
      )
    ).toEqual(JSON.parse(correctSignalQueueMessage));
  });
});
