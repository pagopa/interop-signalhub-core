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
    async updateEservice(eServiceEvent: EserviceEventDto): Promise<number> {
      logger.info(
        `Retrieving E-service from Event with id: ${eServiceEvent.eServiceId}:: eventId: ${eServiceEvent.eventId}`
      );

      // Get Eservice's detail
      const eService = await interopClientService.getEservice(
        eServiceEvent.eServiceId
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
          eServiceEvent.descriptorId // get from event Eservice
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

        return eServiceEvent.eventId;
      }

      logger.info(
        `Eservice with ${entity.eserviceId} already exist on DB with eventId: ${entity.eventId} `
      );
      await producerEserviceRepositoryInstance.updateEservice(
        entity.eserviceId,
        entity.descriptorId,
        eServiceEvent.eventId,
        detailEservice.state
      );

      return eServiceEvent.eventId;
    },

    async checkEserviceTable(
      eServiceId: string,
      producerId: string,
      descriptorId: string,
      eventId: number
    ): Promise<void> {
      logger.info(
        `starting from agreement check if Eservice is already present on DB with eServiceId: ${eServiceId} `
      );

      const entity =
        await producerEserviceRepositoryInstance.findByEserviceIdAndProducerIdAndDescriptorId(
          eServiceId,
          producerId,
          descriptorId
        );

      if (entity) {
        logger.info(
          `Eservice with eServiceId: ${entity.eserviceId} already exist on Eservice table`
        );
        return;
      }

      logger.info(
        `Eservice with eserviceId: ${eServiceId} doesn't exist, creating new one`
      );

      /** If not exist we create an object as EserviceEventDto */

      const eServiceEvent: EserviceEventDto = {
        eServiceId,
        descriptorId,
        eventId,
        eventType: "",
        objectType: "",
      };

      await this.updateEservice(eServiceEvent);
    },
  };
}

export type ProducerService = ReturnType<typeof producerServiceBuilder>;
