import { beforeEach, describe, expect, inject, it } from "vitest";
import { ApiError, genericLogger } from "pagopa-signalhub-commons";
import { deleteAllSqsMessages, SqsConfig } from "pagopa-signalhub-commons-test";
import { ErrorCodes } from "../src/models/domain/errors.js";
import { config } from "../src/config/env.js";
import { quequeService, sqsClient } from "./utils.js";

const sqsConfig: SqsConfig = inject("sqsConfig");
const queueUrl = sqsConfig.queueUrl;

describe("Queue service", () => {
  beforeEach(() => {
    void deleteAllSqsMessages(sqsClient, config.queueUrl);
  });

  it("should send some generic dummy message", async () => {
    const message = {
      some: "value",
    };

    await expect(
      quequeService.send(JSON.stringify(message), genericLogger, queueUrl),
    ).resolves.not.toThrow();
  });

  it("should send a message with unicode char", async () => {
    const omega = "\u{03A9}";
    const desertIslandEmoji = "\u{1F3DD}";
    const tabulation = "\u{0009}";
    const message = {
      omega,
      desertIslandEmoji,
      tabulation,
    };
    await expect(
      quequeService.send(JSON.stringify(message), genericLogger, queueUrl),
    ).resolves.not.toThrow();
  });

  it("should send empty message", async () => {
    await expect(
      quequeService.send(JSON.stringify(""), genericLogger, queueUrl),
    ).resolves.not.toThrow();
  });

  it("should throw a signalNotSendedToQueque error for a non existent queue", async () => {
    const wrongQueueUrl = sqsConfig.queueUrl + "wrong";
    const response = expect(
      quequeService.send(JSON.stringify(""), genericLogger, wrongQueueUrl),
    ).rejects;

    void response.toBeInstanceOf(ApiError<ErrorCodes>);
    void response.toMatchObject({
      code: "signalNotSended",
    });
  });
});
