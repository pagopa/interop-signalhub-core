import { createSignalPayload } from "pagopa-signalhub-commons-test";
import { describe, expect, expectTypeOf, it } from "vitest";

import { toSignalMessage } from "../src/models/domain/toSignalMessage.js";

describe("A signal request from a producer", () => {
  it("should be converted to a Message (string) from a Signal object", async () => {
    const signal = createSignalPayload();
    const correlationId = `some-id`;
    const message = toSignalMessage(signal, correlationId);
    expectTypeOf(message).toBeString();
    expect(JSON.parse(message)).toStrictEqual({ ...signal, correlationId });
  });
});
