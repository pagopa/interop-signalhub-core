import { DB, genericError } from "signalhub-commons";
import fs from "fs";
import { Agreement } from "../model/domain/models.js";

export interface IAgreementRepository {
  findBy: (purposeId: string) => Promise<Agreement | null>;
}

export const agreementRepository = (_db: DB): IAgreementRepository => ({
  async findBy(purposeId: string): Promise<Agreement | null> {
    try {
      const agreement = JSON.parse(
        Buffer.from(fs.readFileSync("./src/data/data.json")).toString()
      );
      return agreement[purposeId] as Agreement;
    } catch (error: any) {
      throw genericError(`Error agreementRepository::findBy ${error.code}`);
    }
  },
});

export type AgreementRepository = typeof agreementRepository;
