import { DB, TableName, genericError } from "pagopa-signalhub-commons";

import { config } from "../config/env.js";

export interface IPurposeRepository {
  findBy: (purposeId: string, state: string) => Promise<null | string>;
}

export const purposeRepository = (db: DB): IPurposeRepository => {
  const purposeTable: TableName = `${config.interopSchema}.purpose`;

  return {
    async findBy(purposeId: string, state: string): Promise<null | string> {
      try {
        return await db.oneOrNone(
          `SELECT consumer_id FROM ${purposeTable} WHERE purpose_id = $1 AND purpose_state = $2`,
          [purposeId, state],
          (rs) => (rs ? rs.consumer_id : null),
        );
      } catch (error: unknown) {
        throw genericError(`Error eserviceRepository::findBy ${error}`);
      }
    },
  };
};

export type PurposeRepository = typeof purposeRepository;
