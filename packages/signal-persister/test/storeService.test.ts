import { genericLogger } from "pagopa-signalhub-commons";
import { createSignal, writeSignal } from "pagopa-signalhub-commons-test";
import { describe, expect, it } from "vitest";

import { config } from "../src/config/env.js";
import {
  notRecoverableMessageError,
  recoverableMessageError
} from "../src/models/domain/errors.js";
import {
  postgresDB,
  storeSignalService,
  wrongStoreSignalService
} from "./utils.js";

describe("Signal Store Service", () => {
  it("should throw an unrecoverable error if signal already exist on db", async () => {
    const signal = createSignal({ signalId: 1 });
    await writeSignal(signal, postgresDB, config.signalHubSchema);
    await expect(
      storeSignalService.storeSignal(signal, genericLogger)
    ).rejects.toThrowError(
      notRecoverableMessageError("duplicateSignal", signal)
    );
  });
  it("should save a signal", async () => {
    const signal = createSignal({ signalId: 1 });
    await expect(
      storeSignalService.storeSignal(signal, genericLogger)
    ).resolves.not.toThrow();
  });
  it("should save a signal even if there's another signal", async () => {
    const oneSignal = createSignal({ signalId: 1 });
    await writeSignal(oneSignal, postgresDB, config.signalHubSchema);
    const anotherSignal = createSignal();
    await expect(
      storeSignalService.storeSignal(anotherSignal, genericLogger)
    ).resolves.not.toThrow();
  });
  it("should throw an recoverable error if db is down", async () => {
    await expect(
      wrongStoreSignalService.storeSignal(createSignal(), genericLogger)
    ).rejects.toThrowError(recoverableMessageError("dbConnection"));
  });
});
