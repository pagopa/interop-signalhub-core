import { genericError, DB } from "pagopa-signalhub-commons";

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
        "SELECT eservice_id FROM DEV_INTEROP.eservice WHERE producer_id = $1 AND eservice_id = $2 AND state = $3",
        [producerId, eserviceId, state],
        (result) => {
          if (result) {
            return result.eservice_id;
          }
          return null;
        }
      );
    } catch (error: unknown) {
      throw genericError(`Error eserviceRepository::findBy ${error}`);
    }
  },
});

export type EserviceRepository = typeof eserviceRepository;
