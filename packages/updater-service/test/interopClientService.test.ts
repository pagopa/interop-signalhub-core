import { expect, describe, it } from "vitest";
import { interopClientService } from "./utils";

describe("Interop client service", () => {
  it("Should retrieve a list of Agreements Events", async () => {
    const lastId = 1;
    const response = await interopClientService.getAgreementsEvents(lastId);

    expect(response.lastEventId).toBe(3);
    expect(response.events.length).toBe(3);
  });
  it("Should retrieve a list of Eservices Events", async () => {
    const lastId = 1;
    const response = await interopClientService.getEservicesEvents(lastId);

    expect(response.lastEventId).toBe(3);
    expect(response.events.length).toBe(3);
  });

  it("Should get a specific agreement by id and transform it on consumerEservice object domain", async () => {
    const eventId = 1;
    const response = await interopClientService.getConsumerEservice(
      "2bf9db22-2b07-4ab8-acba-5fe34432820f",
      eventId
    );

    expect(response).haveOwnPropertyDescriptor("eventId");
    expect(response).haveOwnPropertyDescriptor("eserviceId");
    expect(response).haveOwnPropertyDescriptor("producerId");
    expect(response).haveOwnPropertyDescriptor("agreementId");
    expect(response).haveOwnPropertyDescriptor("descriptorId");
    expect(response).haveOwnPropertyDescriptor("state");
  });

  it("Should be able to get an eService from eServiceId", async () => {
    const eserviceId = "9d93e350-49fb-4e52-831a-dab97a7acae4";
    const response = await interopClientService.getEservice(eserviceId);

    expect(response).toBeDefined();
    expect(response?.id).toBe(eserviceId);
  });

  it("Should be able to get eService descriptor from eServiceId and descriptorId", async () => {
    const eserviceId = "9d93e350-49fb-4e52-831a-dab97a7acae4";
    const descriptorId = "0bc84a47-35a0-4c9a-a77a-e924202f84c9";
    const response = await interopClientService.getEserviceDescriptor(
      eserviceId,
      descriptorId
    );

    expect(response).toBeDefined();
  });
});
