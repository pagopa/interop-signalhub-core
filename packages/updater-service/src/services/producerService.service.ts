import { DB, Logger } from "signalhub-commons";
import { EserviceEventDto } from "../models/domain/model.js";
import { producerEserviceRepository } from "../repositories/producerEservice.repository.js";
import { InteropClientService } from "./interopClient.service.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function producerServiceBuilder(
  db: DB,
  interopClientService: InteropClientService,
  logger: Logger
) {
  const producerEserviceRepositoryInstance = producerEserviceRepository(db);

  return {
    async updateEservice(eServiceEvent: EserviceEventDto): Promise<unknown> {
      logger.info(
        `Retrieving E-service from Event with id: ${eServiceEvent.eserviceId}:: eventId: ${eServiceEvent.eventId}`
      );

      const eService = await interopClientService.getEservice(
        eServiceEvent.eserviceId
      );

      logger.info(`Retrieved E-service with eServiceId: ${eService.id}" `);

      /** Need to getEserviceDescriptor detail in order to retrieve state information of the eservice */
      const detailEservice = await interopClientService.getEserviceDescriptor(
        eService.id,
        eServiceEvent.descriptorId
      );

      logger.info(
        `Retrieved detail for e-service with eServiceId : ${detailEservice.id}`
      );

      /** Check if in db this eservice already exist */
      const entity =
        await producerEserviceRepositoryInstance.findByEserviceIdAndProducerIdAndDescriptorId(
          eService.id, // get from GetEservice
          eService.producer.id, // get from GetEservice
          eServiceEvent.descriptorId // get from getEserviceDescriptor
        );

      if (!entity) {
        logger.info(
          `Eservice with eServiceId: ${eService.id} doesn't exist, creating new one`
        );
        await producerEserviceRepositoryInstance.insertEservice(
          eService.id,
          eService.producer.id,
          eServiceEvent.descriptorId,
          eServiceEvent.eventId,
          detailEservice.state
        );

        return;
      }

      logger.info(`Eservice already exist with state ${entity.state}`);
      await producerEserviceRepositoryInstance.updateEservice(
        entity.eserviceId,
        entity.descriptorId,
        eServiceEvent.eventId,
        detailEservice.state
      );
    },

    async checkAndUpdate(
      eServiceId: string,
      producerId: string,
      descriptorId: string,
      _eventId: number
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

      // await producerEserviceRepositoryInstance.insertEservice(
      //   eServiceId,
      //   producerId,
      //   descriptorId,
      //   eventId
      // );
    },
  };
}
