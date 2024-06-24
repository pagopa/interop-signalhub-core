import { describe, it } from "node:test";
import { interopClientService } from "./utils";

describe("Interop client service", () => {
  it("Should retrieve a list of Eservices Events", async () => {
    await interopClientService.getEservicesEvents(1);
  });
});
