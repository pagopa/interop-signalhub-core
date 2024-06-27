import { describe, it, expect, vi } from "vitest";
import { consumerServiceBuilder } from "../src/services/consumer.service.js";
import { AgreementEventDto } from "../src/models/domain/model.js";
import { IProducerService } from "../src/services/producerService.service.js";
import { interopClientService, loggerInstance } from "./utils.js";

describe("ConsumerService", () => {
  const agreementEventDto: AgreementEventDto = {
    agreementId: "2bf9db22-2b07-4ab8-acba-5fe34432820f", // agreementId available on webhook for testing with mockserver
    eventId: 1,
    objectType: "",
    eventType: "ADDED",
  };

  const findByEserviceIdAndConsumerIdAndDescriptorIdMockFn = vi
    .fn()
    .mockResolvedValue(null);

  const producerService = {
    checkEserviceTable: vi.fn(),
  };

  it("Should insert a record on CONSUMER_ESERVICE table if not exist", async () => {
    const consumerEserviceRepository = {
      findByEserviceIdAndConsumerIdAndDescriptorId:
        findByEserviceIdAndConsumerIdAndDescriptorIdMockFn,
      insertConsumerEservice: vi.fn(),
      updateConsumerEservice: vi.fn(),
    };

    const consumerService = consumerServiceBuilder(
      consumerEserviceRepository,
      interopClientService,
      producerService as unknown as IProducerService,
      loggerInstance
    );

    await consumerService.updateConsumer(agreementEventDto);

    expect(
      consumerEserviceRepository.findByEserviceIdAndConsumerIdAndDescriptorId
    ).toBeCalledTimes(1);

    expect(consumerEserviceRepository.insertConsumerEservice).toBeCalledTimes(
      1
    );
    expect(consumerEserviceRepository.updateConsumerEservice).not.toBeCalled();
  });

  it("Should update a record on ConsumerEservice if already present", async () => {
    const consumerEserviceRepository = {
      findByEserviceIdAndConsumerIdAndDescriptorId: vi.fn().mockResolvedValue({
        eserviceId: "9d93e350-49fb-4e52-831a-dab97a7acae4",
        producerId: "0bc84a47-35a0-4c9a-a77a-e924202f84c9",
        descriptorId: "0bc84a47-35a0-4c9a-a77a-e924202f84c9",
      }),
      insertConsumerEservice: vi.fn(),
      updateConsumerEservice: vi.fn(),
    };

    const producerService = {
      checkEserviceTable: vi.fn(),
    };

    const consumerService = consumerServiceBuilder(
      consumerEserviceRepository,
      interopClientService,
      producerService as unknown as IProducerService,
      loggerInstance
    );

    await consumerService.updateConsumer(agreementEventDto);

    expect(
      consumerEserviceRepository.findByEserviceIdAndConsumerIdAndDescriptorId
    ).toBeCalledTimes(1);
    expect(consumerEserviceRepository.insertConsumerEservice).not.toBeCalled();
    expect(consumerEserviceRepository.updateConsumerEservice).toBeCalledTimes(
      1
    );

    // Result from mockserver is a detailAgreement with state ACTIVE
    expect(producerService.checkEserviceTable).toBeCalledTimes(1);
  });
});
