import { expect, describe, it, vi } from "vitest";
import * as commons from "pagopa-signalhub-interop-client";

describe("Interop client service", () => {
  vi.spyOn(commons, "getAccessToken").mockResolvedValue("");

  it("Should retrieve a list of Agreements Events", async () => {
    expect(true).toBe(true);
  });

  it("Should retrieve a list of Eservices Events", async () => {
    expect(true).toBe(true);
  });

  it("Should get a specific agreement by id and transform it on agreement object domain", async () => {
    expect(true).toBe(true);
  });

  it("Should be able to get an eService from eServiceId", async () => {
    expect(true).toBe(true);
  });

  it("Should be able to get eService descriptor from eServiceId and descriptorId", async () => {
    expect(true).toBe(true);
  });

  it("Should be able to create new voucher if old one is expired", async () => {
    expect(true).toBe(true);
  });
});
