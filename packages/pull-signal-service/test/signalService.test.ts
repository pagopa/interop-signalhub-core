import { describe, expect, it } from "vitest";
import { genericLogger } from "signalhub-commons";
import { signalService } from "./utils";

describe("Pull Signal service", () => {
  it("should recover an empty signals list", async () => {
    const signalId = 0;
    const eserviceId = "test-eservice-id";
    const size = 10;
    const { signals, lastSignalId } = await signalService.recover(
      eserviceId,
      signalId,
      size,
      genericLogger
    );
    expect(signals).toEqual([]);
    expect(lastSignalId).toBeNull();
  });
});
