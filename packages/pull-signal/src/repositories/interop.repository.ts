import { genericError, DB } from "pagopa-signalhub-commons";

export interface IInteropRepository {
  findBy: (
    eserviceId: string,
    purposeId: string,
    state: string
  ) => Promise<{
    agreement?: { id: string; state: string; consumerId: string };
  } | null>;
}

export const interopRepository = (db: DB): IInteropRepository => ({
  async findBy(
    eserviceId: string,
    purposeId: string,
    purposeState: string
  ): Promise<{
    agreement?: { id: string; state: string; consumerId: string };
  } | null> {
    try {
      return await db.oneOrNone(
        "select agreement.agreement_id, agreement.state, agreement.consumer_id from dev_interop.purpose purpose, dev_interop.agreement agreement where purpose.consumer_id = agreement.consumer_id and agreement.eservice_id = $1 and purpose.purpose_id = $2 and UPPER(purpose.purpose_state) = UPPER($3)",
        [eserviceId, purposeId, purposeState],
        (rs) =>
          rs
            ? {
                agreement: {
                  id: rs.agreement_id,
                  state: rs.state,
                  consumerId: rs.consumer_id,
                },
              }
            : null
      );
    } catch (error: unknown) {
      throw genericError(`Error interopRepository::findBy ${error}`);
    }
  },
});

export type InteropRepository = typeof interopRepository;
