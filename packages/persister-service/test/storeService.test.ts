import { describe, expect, it } from "vitest";
import { processMessage } from "../src/messageHandler.js";
import {
  notRecoverableGenericMessageError,
  notRecoverableMessageError,
} from "../src/models/domain/errors.js";
import { signalIdDuplicatedForEserviceId } from "../../push-signal-service/src/model/domain/errors.js";
// message malformed
// message save ok
// errore recuperabile/non recuperabile

describe("Process message", () => {
  it("should throw an error if message is malformed", async () => {
    const queueMessage = {
      MessageAttributes: {
        Title: {
          DataType: "String",
          StringValue: "The Whistler",
        },
        Author: {
          DataType: "String",
          StringValue: "John Grisham",
        },
        WeeksOn: {
          DataType: "Number",
          StringValue: "6",
        },
      },
      MessageBody:
        "Information about current NY Times fiction bestseller for week of 12/11/2016.",
    };
    await expect(processMessage()(queueMessage)).rejects.toThrow(
      notRecoverableGenericMessageError("parsingError")
    );
  });
});
