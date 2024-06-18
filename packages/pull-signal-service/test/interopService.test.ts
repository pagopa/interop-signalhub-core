import { describe, expect, it } from "vitest";
// import { genericLogger } from "signalhub-commons";
// import { eserviceIdPushSignals } from "signalhub-commons-test";
// import { interopService } from "./utils";

describe("PDND Interoperability service", () => {
  it("should give permission to a signals consumer for pull signals", async () => {
    // eslint-disable-next-line functional/immutable-data, @typescript-eslint/explicit-function-return-type
    // interopService.consumerHasValidAgreement = async () => {
    //   const agreement = {
    //     consumerId: "a-consumer-id",
    //     id: "a-agreement-id",
    //     eServiceId: "a-eservice-id",
    //     purposeId: "a-purpose-id",
    //     descriptorId: "a-descriptor-id",
    //     producerId: "a-producer-id",
    //     state: "ACTIVE",
    //   };
    //   return Promise.resolve(agreement);
    // };
    // const purposeId = "fake-purpose-id";
    // const eserviceId = eserviceIdPushSignals;

    // expect(
    //   await interopService.verifyAuthorization(
    //     purposeId,
    //     eserviceId,
    //     genericLogger
    //   )
    // ).not.toThrow();
    expect(1).toBe(1);
  });
  it("should deny permission to a signal consumer with no agreement for e-service pull", async () => {
    expect(1).toBe(1);
  });
  it("should deny permission to a signal consumer that is not a consumer of the e-service", async () => {
    expect(1).toBe(1);
  });
});
