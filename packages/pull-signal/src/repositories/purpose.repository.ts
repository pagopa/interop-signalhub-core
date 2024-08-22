import { genericError, DB } from "pagopa-signalhub-commons";

export interface IPurposeRepository {
  findBy: (purposeId: string, state: string) => Promise<string | null>;
}

export const purposeRepository = (db: DB): IPurposeRepository => ({
  async findBy(purposeId: string, state: string): Promise<string | null> {
    try {
      return await db.oneOrNone(
        "SELECT consumer_id FROM DEV_INTEROP.purpose WHERE purpose_id = $1 AND purpose_state = $2",
        [purposeId, state],
        (rs) => (rs ? rs.consumer_id : null)
      );
    } catch (error: unknown) {
      throw genericError(`Error eserviceRepository::findBy ${error}`);
    }
  },
});

export type PurposeRepository = typeof purposeRepository;
