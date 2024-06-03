import {
  DB,
  Logger,
  createDbInstance,
  operationForbidden,
} from "signalhub-commons";
import { signalRepository } from "../repositories/signal.repository.js";
import { config } from "../config/config.js";
import { eserviceRepository } from "../repositories/eservice.repository.js";
import { signalIdDuplicatedForEserviceId } from "../model/domain/errors.js";
import { agreementRepository } from "../repositories/agreement.repository.js";
import { Agreement } from "../model/domain/models.js";

const db: DB = createDbInstance({
  username: config.signalhubStoreDbUsername,
  password: config.signalhubStoreDbPassword,
  host: config.signalhubStoreDbHost,
  port: config.signalhubStoreDbPort,
  database: config.signalhubStoreDbName,
  schema: config.signalhubStoreDbSchema,
  useSSL: config.signalhubStoreDbUseSSL,
});

export function storeServiceBuilder() {
  return {
    async verifySignalDuplicated(
      signalId: number,
      eserviceId: string,
      logger: Logger
    ): Promise<void> {
      logger.debug(
        `StoreService::verifySignalDuplicated signald: ${signalId}, eserviceId: ${eserviceId}`
      );
      const signalIdPresent = await signalRepository(db).findBy(
        signalId,
        eserviceId
      );
      if (signalIsDuplicated(signalIdPresent)) {
        throw signalIdDuplicatedForEserviceId(signalId, eserviceId);
      }
    },
    async producerIsEserviceOwner(
      producerId: string,
      eserviceId: string,
      logger: Logger
    ): Promise<void> {
      logger.info(
        `StoreService::producerIsEserviceOwner eserviceId: ${eserviceId} producerId: ${producerId}`
      );
      const state = "PUBLISHED";
      const eserviceOwned = await eserviceRepository(db).findBy(
        producerId,
        eserviceId,
        state
      );
      logger.debug(
        `StoreService::producerIsEserviceOwner eserviceOwned: ${eserviceOwned}`
      );
      if (eserviceOwned) {
        return;
      }
      throw operationForbidden;
    },
    async getAgreementWithDepositSignalBy(
      purposeId: string,
      logger: Logger
    ): Promise<Agreement> {
      logger.info(
        `StoreService::getAgreementWithDepositSignalBy purposeId: ${purposeId}`
      );
      const agreement = await agreementRepository(db).findBy(purposeId);
      logger.debug(
        `StoreService::getAgreementWithDepositSignalBy agreement: ${JSON.stringify(agreement)}`
      );
      if (agreement) {
        return agreement;
      }
      throw operationForbidden;
    },
    async canProducerDepositSignal(
      purposeId: string,
      eserviceId: string,
      logger: Logger
    ) {
      logger.info(
        `StoreService::canProducerDepositSignal purposeId: ${purposeId} eserviceId: ${eserviceId}`
      );
      const agreement = await this.getAgreementWithDepositSignalBy(
        purposeId,
        logger
      );
      const { consumerId: producerId } = agreement;
      await this.producerIsEserviceOwner(producerId, eserviceId, logger);
    },
  };
}

const signalIsDuplicated = (signalIdPresent: number | null) =>
  signalIdPresent !== null;

export type StoreService = ReturnType<typeof storeServiceBuilder>;
