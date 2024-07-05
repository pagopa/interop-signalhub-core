import { describe, expect, it } from "vitest";
import { signalService } from "./utils.js";

describe("Signal service", () => {
  it("If signal not exist on db should not throw an error", async () => {
    await signalService.cleanup(12);
    expect(1).toBe(1);
  });
});
