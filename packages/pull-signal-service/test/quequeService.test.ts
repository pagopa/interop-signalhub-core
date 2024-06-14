import { ApiError, genericLogger } from "signalhub-commons";
import { describe, expect, it } from "vitest";
import { ErrorCodes } from "../src/model/domain/errors";
import { quequeService } from "./utils";

describe("Queue service", () => {
  it("should send some generic dummy message", async () => {
    const message = {
      some: "value",
    };
    await expect(
      quequeService.send(JSON.stringify(message), genericLogger)
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
      quequeService.send(JSON.stringify(message), genericLogger)
    ).resolves.not.toThrow();
  });
  it("should send empty message", async () => {
    await expect(quequeService.send("", genericLogger)).resolves.not.toThrow();
  });
  it("should throw a signalNotSendedToQueque error for a non existent queue", async () => {
    const wrongQueueUrl = "wrong-url";
    const response = expect(
      quequeService.send("", genericLogger, wrongQueueUrl)
    ).rejects;
    void response.toBeInstanceOf(ApiError<ErrorCodes>);
    void response.toMatchObject({
      code: "signalNotSended",
    });
  });
});
