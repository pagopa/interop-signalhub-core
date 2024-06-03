import { genericLogger } from "signalhub-commons";
import { describe, it } from "vitest";
import { storeService } from "./utils";

describe("Store service", () => {
  it("verifySignalDuplicated", async () => {
    const signalId = 123;
    const eserviceId = "123";
    await storeService.verifySignalDuplicated(
      signalId,
      eserviceId,
      genericLogger
    );
  });
});
