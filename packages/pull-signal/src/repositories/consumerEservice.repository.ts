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
        "SELECT consumer_id FROM DEV_INTEROP.consumer_eservice c WHERE c.consumer_id = $1 AND c.eservice_id = $2 AND c.state = $3",
        [consumerId, eserviceId, state]
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw genericError(`Error eserviceRepository::findBy ${error.code}`);
    }
  },
});

export type ConsumerEserviceRepository = typeof consumerEserviceRepository;
