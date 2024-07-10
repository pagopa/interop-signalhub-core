import { describe, expect, vi, it, beforeEach } from "vitest";
import { Event } from "signalhub-interop-client";
import { deadServiceBuilder } from "../src/services/deadEvent.service";
import { TracingBatchService } from "../src/services/tracingBatch.service";
import { config } from "../src/config/env";
import { loggerInstance } from "./utils";

const event: Event = {
  eventId: 1,
  eventType: "ADDED",
  objectId: {
    eServiceId: "9d93e350-49fb-4e52-831a-dab97a7acae4",
    descriptorId: "0bc84a47-35a0-4c9a-a77a-e924202f84c9",
  },
  objectType: "ESERVICE",
};

describe("DeadEventService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const deadEventRepository = {
    insertDeadEvent: vi.fn(),
  };
  it("Should save Event on dead_event table if number of error is greater than attemptEvent", async () => {
    const numberOfErrorsWithEqualEventId = 3;
    // eslint-disable-next-line functional/immutable-data
    config.attemptEvent = 2;

    const tracingBatchService = {
      countBatchInErrorWithLastEventIdAndType: vi
        .fn()
        .mockResolvedValue(numberOfErrorsWithEqualEventId),
    };
    const deadService = deadServiceBuilder(
      deadEventRepository,
      tracingBatchService as unknown as TracingBatchService,
      loggerInstance
    );

    await deadService.saveDeadEvent(event, "ESERVICE", "errorReasonTest");
    expect(deadEventRepository.insertDeadEvent).toBeCalledTimes(1);
  });

  it("Should not save Event on dead_event table if number of error is less than attemptEvent", async () => {
    const numberOfErrorsWithEqualEventId = 0;
    // eslint-disable-next-line functional/immutable-data
    config.attemptEvent = 1;

    const tracingBatchService = {
      countBatchInErrorWithLastEventIdAndType: vi
        .fn()
        .mockResolvedValue(numberOfErrorsWithEqualEventId),
    };
    const deadService = deadServiceBuilder(
      deadEventRepository,
      tracingBatchService as unknown as TracingBatchService,
      loggerInstance
    );

    await deadService.saveDeadEvent(event, "ESERVICE", "errorReasonTest");
    expect(deadEventRepository.insertDeadEvent).not.toBeCalled();
  });
});
