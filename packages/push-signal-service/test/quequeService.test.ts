import { SQS, genericLogger } from "signalhub-commons";
import { describe, expect, it } from "vitest";
import { quequeService, sqsClient } from "./utils";
import { config } from "../src/config/env";

describe("Queue service", () => {
  it("should send a message", async () => {
    const message = {
      signalId: "signalId2",
      eserviceId: "eserviceId",
    };
    // const queueUrl = await SQS.getQueueUrl(sqsClient, config.queueName);
    await expect(
      quequeService.send(JSON.stringify(message), genericLogger)
    ).resolves.not.toThrow();
  });
});
