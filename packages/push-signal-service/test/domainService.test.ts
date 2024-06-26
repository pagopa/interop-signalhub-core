import { genericLogger } from "signalhub-commons";
import { createSignalPayload } from "signalhub-commons-test";
import { describe, expect, expectTypeOf, it } from "vitest";
import { domainService } from "./utils.js";
describe("Domain Service", () => {
  it("should get a Message (string) from a Signal object", async () => {
    const signal = createSignalPayload();
    const correlationId = `some-id`;
    const message = domainService.signalToMessage(
      signal,
      correlationId,
      genericLogger
    );
    expectTypeOf(message).toBeString();
    expect(JSON.parse(message)).toStrictEqual({ ...signal, correlationId });
  });
});
