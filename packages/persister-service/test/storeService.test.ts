import { describe, expect, it } from "vitest";
import {
  notRecoverableMessageError,
  recoverableMessageError,
} from "../src/models/domain/errors.js";

import { createSignal, writeSignal } from "signalhub-commons-test";
import {
  postgresDB,
  storeSignalService,
  wrongStoreSignalService,
} from "./utils";

describe("Signal Store Service", () => {
  it("should throw an unrecoverable error if signal already exist on db", async () => {
    const signal = createSignal({ signalId: 1 });
    await writeSignal(signal, postgresDB);
    await expect(storeSignalService.storeSignal(signal)).rejects.toThrowError(
      notRecoverableMessageError("duplicateSignal", signal)
    );
  });
  it("should save a signal", async () => {
    const signal = createSignal({ signalId: 1 });
    await expect(storeSignalService.storeSignal(signal)).resolves.not.toThrow();
  });
  it("should save a signal even if there's another signal", async () => {
    const oneSignal = createSignal({ signalId: 1 });
    await writeSignal(oneSignal, postgresDB);
    const anotherSignal = createSignal();
    await expect(
      storeSignalService.storeSignal(anotherSignal)
    ).resolves.not.toThrow();
  });
  it("should throw an recoverable error if db is down", async () => {
    await expect(
      wrongStoreSignalService.storeSignal(createSignal())
    ).rejects.toThrowError(recoverableMessageError("dbConnection"));
  });
});
