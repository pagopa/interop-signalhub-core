import { describe, it, expect, vi, afterEach } from "vitest";
import { truncateTracingBatchTable } from "signalhub-commons-test";
import { ProducerService } from "signalhub-commons";
import { EserviceEventDto } from "../src/models/domain/model.js";
import {
  IProducerServiceRepository,
  producerEserviceRepository,
} from "../src/repositories/producerEservice.repository.js";
import { producerServiceBuilder } from "../src/services/producerService.service.js";
import { InteropClientService } from "../src/services/interopClient.service.js";
import { interopClientService, loggerInstance, postgresDB } from "./utils.js";

describe("ProducerEservice service", () => {
  const eServiceEvent: EserviceEventDto = {
    eServiceId: "9d93e350-49fb-4e52-831a-dab97a7acae4",
    descriptorId: "0bc84a47-35a0-4c9a-a77a-e924202f84c9",
    eventId: 1,
    eventType: "ADDED",
    objectType: "ESERVICE",
  };

  const findByEserviceIdAndProducerIdAndDescriptorIdMockFn = vi
    .fn()
    .mockResolvedValue({
      eserviceId: eServiceEvent.eServiceId,
      descriptorId: eServiceEvent.descriptorId,
      eventId: eServiceEvent.eventId,
      state: "ACTIVE",
    });

  it("Should insert a record on ESERVICE table if not exist", async () => {
    const producerEserviceRepository: IProducerServiceRepository = {
      findByEserviceIdAndProducerIdAndDescriptorId: vi
        .fn()
        .mockResolvedValue(null),

      insertEservice: vi.fn().mockResolvedValue({
        eserviceId: eServiceEvent.eServiceId,
        descriptorId: eServiceEvent.descriptorId,
        eventId: eServiceEvent.eventId,
        state: "",
      }),

      updateEservice: vi.fn(),
    };

    const producerEservice = producerServiceBuilder(
      producerEserviceRepository,
      interopClientService,
      loggerInstance
    );

    const response = (await producerEservice.updateEservice(
      eServiceEvent
    )) as ProducerService;

    expect(producerEserviceRepository.insertEservice).toBeCalledTimes(1);
    expect(response.eserviceId).toBe(eServiceEvent.eServiceId);
    expect(response.eventId).toBe(eServiceEvent.eventId);
  });

  it("Should update a record on ESERVICE if is already present", async () => {
    const producerEserviceRepository: IProducerServiceRepository = {
      findByEserviceIdAndProducerIdAndDescriptorId:
        findByEserviceIdAndProducerIdAndDescriptorIdMockFn,
      updateEservice: vi.fn().mockResolvedValue({
        eserviceId: eServiceEvent.eServiceId,
        descriptorId: eServiceEvent.descriptorId,
        eventId: eServiceEvent.eventId,
        state: "ACTIVE",
      }),
      insertEservice: vi.fn(),
    };

    const producerEservice = producerServiceBuilder(
      producerEserviceRepository,
      interopClientService,
      loggerInstance
    );

    const response = (await producerEservice.updateEservice(
      eServiceEvent
    )) as ProducerService;

    expect(producerEserviceRepository.updateEservice).toBeCalledTimes(1);
    expect(response.eserviceId).toBe(eServiceEvent.eServiceId);
    expect(response.eventId).toBe(eServiceEvent.eventId);
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
