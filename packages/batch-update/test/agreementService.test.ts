import { describe, it, expect, vi, afterEach } from "vitest";
import * as commons from "pagopa-signalhub-interop-client";
import { truncateTracingBatchTable } from "pagopa-signalhub-commons-test";
import { AgreementEventDto } from "../src/models/domain/model.js";
import { IProducerService } from "../src/services/producerService.service.js";
import { agreementServiceBuilder } from "../src/services/agreement.service.js";
import { interopClientService, loggerInstance, postgresDB } from "./utils.js";

describe("AgreementService", () => {
  vi.spyOn(commons, "getAccessToken").mockResolvedValue("");

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

  it("Should insert a record on AGREEMENT table if not exist", async () => {
    const agreementRepository = {
      findByEserviceIdAndConsumerIdAndDescriptorId:
        findByEserviceIdAndConsumerIdAndDescriptorIdMockFn,
      insertAgreement: vi.fn(),
      updateAgreement: vi.fn(),
    };

    const agreementService = agreementServiceBuilder(
      agreementRepository,
      interopClientService,
      producerService as unknown as IProducerService,
      loggerInstance
    );

    await agreementService.updateAgreement(agreementEventDto);

    expect(
      agreementRepository.findByEserviceIdAndConsumerIdAndDescriptorId
    ).toBeCalledTimes(1);

    expect(agreementRepository.insertAgreement).toBeCalledTimes(1);
    expect(agreementRepository.updateAgreement).not.toBeCalled();
  });

  it("Should update a record on AGREEMENT table if it's already present", async () => {
    const agreementRepository = {
      findByEserviceIdAndConsumerIdAndDescriptorId: vi.fn().mockResolvedValue({
        eserviceId: "9d93e350-49fb-4e52-831a-dab97a7acae4",
        producerId: "0bc84a47-35a0-4c9a-a77a-e924202f84c9",
        descriptorId: "0bc84a47-35a0-4c9a-a77a-e924202f84c9",
      }),
      insertAgreement: vi.fn(),
      updateAgreement: vi.fn(),
    };

    const producerService = {
      checkEserviceTable: vi.fn(),
    };

    const agreementService = agreementServiceBuilder(
      agreementRepository,
      interopClientService,
      producerService as unknown as IProducerService,
      loggerInstance
    );

    await agreementService.updateAgreement(agreementEventDto);

    expect(
      agreementRepository.findByEserviceIdAndConsumerIdAndDescriptorId
    ).toBeCalledTimes(1);
    expect(agreementRepository.insertAgreement).not.toBeCalled();
    expect(agreementRepository.updateAgreement).toBeCalledTimes(1);

    // Result from mockserver is a detailAgreement with state ACTIVE
    expect(producerService.checkEserviceTable).toBeCalledTimes(1);
  });

  afterEach(() => truncateTracingBatchTable(postgresDB));
});
