import { genericInternalError } from "signalhub-commons";
import { DB } from "./db.js";

export interface IEserviceRepository {
  findBy: (
    producerId: string,
    eserviceId: string,
    state: string
  ) => Promise<string | null>;
}

export const eserviceRepository = (db: DB): IEserviceRepository => ({
  async findBy(
    producerId: string,
    eserviceId: string,
    state: string
  ): Promise<string | null> {
    try {
      return await db.oneOrNone(
        "SELECT eservice_id FROM eservice WHERE producer_id = $1 AND eservice_id = $2 AND state = $3",
        [producerId, eserviceId, state]
      );
    } catch (error) {
      throw genericInternalError(`Error findBy: ${error}`);
    }
  },
});

export type EserviceRepository = typeof eserviceRepository;
