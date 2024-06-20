import { ApiError, genericLogger } from "signalhub-commons";
import { describe, expect, inject, it } from "vitest";
import { SqsConfig } from "signalhub-commons-test/dist/setupTestContainersVitestGlobal.js";
import { ErrorCodes } from "../src/model/domain/errors.js";
import { quequeService } from "./utils.js";

const sqsConfig: SqsConfig = inject("sqsConfig");
const queueUrl = sqsConfig.queueUrl;

describe("Queue service", () => {
  it("should send some generic dummy message", async () => {
    const message = {
      some: "value",
    };

    await expect(
      quequeService.send(JSON.stringify(message), genericLogger, queueUrl)
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
      quequeService.send(JSON.stringify(message), genericLogger, queueUrl)
    ).resolves.not.toThrow();
  });
  it("should send empty message", async () => {
    await expect(
      quequeService.send(JSON.stringify(""), genericLogger, queueUrl)
    ).resolves.not.toThrow();
  });
  it("should throw a signalNotSendedToQueque error for a non existent queue", async () => {
    const wrongQueueUrl = "http://localhost:9324/000000000000/wrongLocalQueues";
    const response = expect(
      quequeService.send(JSON.stringify(""), genericLogger, wrongQueueUrl)
    ).rejects;

    void response.toBeInstanceOf(ApiError<ErrorCodes>);
    void response.toMatchObject({
      code: "signalNotSended",
    });
  });
});
