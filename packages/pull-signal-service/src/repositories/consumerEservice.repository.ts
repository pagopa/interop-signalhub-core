import { genericError, DB } from "signalhub-commons";

export interface IConsumerEserviceRepository {
  findBy: (
    consumerId: string,
    eserviceId: string,
    state: string
  ) => Promise<string | null>;
}

export const consumerEserviceRepository = (
  db: DB
): IConsumerEserviceRepository => ({
  async findBy(
    consumerId: string,
    eserviceId: string,
    state: string
  ): Promise<string | null> {
    try {
      return await db.oneOrNone(
        "SELECT consumer_id FROM consumer_eservice WHERE consumer_id = $1 AND eservice_id = $2 AND state = $3",
        [consumerId, eserviceId, state]
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw genericError(`Error eserviceRepository::findBy ${error.code}`);
    }
  },
});

export type ConsumerEserviceRepository = typeof consumerEserviceRepository;
