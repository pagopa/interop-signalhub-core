/* eslint-disable functional/no-method-signature */
import { DB, genericInternalError } from "pagopa-signalhub-commons";

export interface IEserviceProduceRepository {
  insert(eServiceId: string, producerId: string): Promise<void>;
  findProducerIdByEserviceId(eServiceId: string): Promise<string | null>;
}
export const eServiceProducerRepository = (
  db: DB
): IEserviceProduceRepository => ({
  async insert(eServiceId: string, producerId: string): Promise<void> {
    try {
      await db.none(
        "INSERT INTO DEV_INTEROP.eservice_producer(eservice_id, producer_id) VALUES ($1, $2)",
        [eServiceId, producerId]
      );
    } catch (error) {
      throw genericInternalError(`Error inserting eservice: ${error}`);
    }
  },

  async findProducerIdByEserviceId(eServiceId: string): Promise<string | null> {
    try {
      const result = await db.oneOrNone(
        "SELECT producer_id FROM DEV_INTEROP.eservice_producer WHERE eservice_id = $1",
        [eServiceId]
      );

      if (!result) {
        return null;
      }

      return result.producer_id;
    } catch (error) {
      throw genericInternalError(`Error findProducerIdByEserviceId ${error}`);
    }
  },
});
