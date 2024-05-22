import { DB } from "./db.js";

export interface ISignalHubRepository {
  readSomething: () => Promise<void>;
}

export const signalHubRepository = (db: DB): ISignalHubRepository => ({
  async readSomething(): Promise<any> {
    try {
      const eservices = await db.any(
        "SELECT * FROM eservice WHERE state = $1",
        "PUBLISHED"
      );
      return eservices;
    } catch (error) {}
  },
});

export type SignalHubRepository = typeof signalHubRepository;
