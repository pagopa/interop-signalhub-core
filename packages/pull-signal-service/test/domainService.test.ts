import { genericLogger } from "signalhub-commons";
import { describe, expect, expectTypeOf, it } from "vitest";
import { createSignalPayload } from "./../../commons-test/src/databaseUtils";
import { domainService } from "./utils";

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