import { expect, describe, it, vi } from "vitest";
import * as commons from "signalhub-interop-client";
import { interopClientServiceBuilder } from "../src/services/interopClient.service.js";
import { interopClientService, loggerInstance } from "./utils.js";

describe("Interop client service", () => {
  vi.spyOn(commons, "getAccessToken").mockResolvedValue("");

  it("Should retrieve a list of Agreements Events", async () => {
    const lastId = 0;
    const response = await interopClientService.getAgreementsEvents(lastId);

    expect(response.lastEventId).toBe(3);
    expect(response.events.length).toBe(3);
  });

  it("Should retrieve a list of Eservices Events", async () => {
    const lastId = 0;
    const response = await interopClientService.getEservicesEvents(lastId);

    expect(response.lastEventId).toBe(4);
    expect(response.events.length).toBe(4);
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

  it("Should be able to create new voucher if old one is expired", async () => {
    const spyAccessToken = vi
      .spyOn(commons, "getAccessToken")
      .mockResolvedValue("token");
    const expiredVoucher =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMjMsImV4cCI6MTcxOTkxMzMwMH0.OqLZiIyWDdvE4MIPdoRD0DZ7hFnIkAJXfpBU2qeG8ZQ";
    const interopClientService = interopClientServiceBuilder(
      expiredVoucher,
      loggerInstance
    );

    const voucher = await interopClientService.getCachedVoucher();
    expect(spyAccessToken).toHaveBeenCalledOnce();
    expect(voucher).toBe("token");
  });
});
