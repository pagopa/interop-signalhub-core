import { describe, expect, it } from "vitest";
import { TracingBatchStateEnum } from "../src/models/domain/model";
import { tracingBatchService } from "./utils";

describe("Tracing batch service", () => {
  describe("terminateTracingBatch", () => {
    it("Should insert lastEventId with applicationType = AGREEMENT", async () => {
      const lastEventId = 5;
      const lastEventIdResponse =
        await tracingBatchService.terminateTracingBatch(
          TracingBatchStateEnum.ENDED,
          lastEventId,
          "AGREEMENT"
        );

      expect(lastEventIdResponse).toBe(lastEventId);
    });

    it("Should insert lastEventId with applicationType = ESERVICE", async () => {
      const lastEventId = 5;
      const lastEventIdResponse =
        await tracingBatchService.terminateTracingBatch(
          TracingBatchStateEnum.ENDED,
          lastEventId,
          "ESERVICE"
        );

      expect(lastEventIdResponse).toBe(lastEventId);
    });
  });

  describe("getLastEventIdByTracingBatchAndType", () => {
    it("Should get lastEventId equal to 0 if DB is empty", async () => {
      const lastEventIdResponse =
        await tracingBatchService.getLastEventIdByTracingBatchAndType(
          "AGREEMENT"
        );
      expect(lastEventIdResponse).toBe(0);
    });

    it("Should get lastEventId equal to 5 if updater has been run before and terminated with lastEventId = 5", async () => {
      const lastEventId = await tracingBatchService.terminateTracingBatch(
        TracingBatchStateEnum.ENDED,
        5,
        "ESERVICE"
      );

      expect(
        await tracingBatchService.getLastEventIdByTracingBatchAndType(
          "ESERVICE"
        )
      ).toBe(lastEventId);
    });
  });
});
