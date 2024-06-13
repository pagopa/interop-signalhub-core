import { DB, Logger } from "signalhub-commons";
import { producerEserviceRepository } from "../repositories/producerEService.repository.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function producerServiceBuilder(db: DB, logger: Logger) {
  const producerEserviceRepositoryInstance = producerEserviceRepository(db);

  return {
    async checkAndUpdate(
      eServiceId: string,
      producerId: string,
      descriptorId: string,
      eventId: number
    ): Promise<void> {
      logger.info(`Check and update Eservice with EserviceId:  ${eServiceId} `);

      const entity =
        await producerEserviceRepositoryInstance.findByEserviceIdAndProducerIdAndDescriptorId(
          eServiceId,
          producerId,
          descriptorId
        );

      if (entity) {
        logger.info(`Eservice already exist with state ${entity.state}`);
        return;
      }

      logger.info(
        `Eservice with eserviceId: ${eServiceId} doesn't exist, creating new one`
      );

      await producerEserviceRepositoryInstance.insertEservice(
        eServiceId,
        producerId,
        descriptorId,
        eventId
      );
    },
  };
}
