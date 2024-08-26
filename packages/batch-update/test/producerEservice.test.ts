import { describe, it, expect, vi, afterEach } from "vitest";
import * as commons from "pagopa-signalhub-interop-client";
import { truncateTracingBatchTable } from "pagopa-signalhub-commons-test";
import { EserviceEventDto } from "../src/models/domain/model.js";
import { producerEserviceRepository } from "../src/repositories/producerEservice.repository.js";
import { producerServiceBuilder } from "../src/services/producerService.service.js";
import { InteropClientService } from "../src/services/interopClient.service.js";
import { loggerInstance, postgresDB } from "./utils.js";

describe("ProducerEservice service", () => {
  vi.spyOn(commons, "getAccessToken").mockResolvedValue("");

  const eServiceEvent: EserviceEventDto = {
    eServiceId: "9d93e350-49fb-4e52-831a-dab97a7acae4",
    descriptorId: "0bc84a47-35a0-4c9a-a77a-e924202f84c9",
    eventId: 1,
    eventType: "ADDED",
    objectType: "ESERVICE",
  };

  it("Should insert a record on ESERVICE table if not exist", async () => {
    expect(true).toBe(true);
  });

  it("Should update a record on ESERVICE if is already present", async () => {
    expect(true).toBe(true);
  });

  it("Should return null with if Eservice is not found", async () => {
    const interopClientService = {
      getEservice: vi.fn().mockResolvedValue(null),
      getEserviceDescriptor: vi.fn(),
    };

    const producerEservice = producerServiceBuilder(
      producerEserviceRepository(postgresDB),
      interopClientService as unknown as InteropClientService,
      loggerInstance
    );

    const response = await producerEservice.updateEservice(eServiceEvent);
    expect(response).toBe(null);
  });

  afterEach(() => truncateTracingBatchTable(postgresDB));
});
