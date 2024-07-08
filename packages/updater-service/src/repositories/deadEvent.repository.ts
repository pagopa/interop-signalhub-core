import { DB, genericInternalError } from "signalhub-commons";

export interface IDeadEventRepository {
  insertDeadEvent: (deadEvent: any) => Promise<void>;
}

export const DeadEv = (db: DB): IDeadEventRepository => ({
  async insertDeadEvent(deadEvent): Promise<void> {
    try {
      await db.none(
        "INSERT INTO DEV_INTEROP.DEAD_EVENT (id, event, tmst_created) VALUES ($1, $2, $3)",
        [deadEvent.id, deadEvent.event, deadEvent.tmstCreated]
      );
    } catch (error) {
      throw genericInternalError(`Error insert dead event:" ${error}`);
    }
  },
});
