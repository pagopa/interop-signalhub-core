import { describe, it, expect, vi } from "vitest";
import { EserviceEventDto } from "../src/models/domain/model";
import { interopClientService, producerEservice } from "./utils";
import { producerEserviceRepository } from "../src/repositories/producerEservice.repository";

describe("ProducerEservice service", () => {
  const eServiceEvent: EserviceEventDto = {
    eServiceId: "9d93e350-49fb-4e52-831a-dab97a7acae4",
    descriptorId: "0bc84a47-35a0-4c9a-a77a-e924202f84c9",
    eventId: 1,
    eventType: "ADDED",
    objectType: "ESERVICE",
  };

  it("Should insert a record on ESERVICE table if not exist", async () => {
    const response = await producerEservice.updateEservice(eServiceEvent);
    expect(response).toBe(eServiceEvent.eventId);

    // expect(spyFind).toHaveBeenCalled();
  });
});
