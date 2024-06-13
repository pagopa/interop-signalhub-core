import { DB, SQS } from "signalhub-commons";
import { signalProducer, eserviceProducer } from "./common.js";

async function setupEserviceTable(db: DB): Promise<void> {
  const allProducers = [signalProducer, eserviceProducer];
  // eslint-disable-next-line functional/no-let
  let count = 0;
  for (const producer of allProducers) {
    const { id, eservices } = producer;
    for (const eservice of eservices) {
      const query = {
        text: "INSERT INTO eservice (eservice_id, producer_id, descriptor_id, event_id, state) values ($1, $2, $3, $4, $5)",
        values: [eservice.id, id, eservice.descriptor, ++count, eservice.state],
      };
      await db.oneOrNone(query);
    }
  }
}

export const dataPreparation = async (db: DB): Promise<void> => {
  // console.info(`\n*** SIGNALHUB DATA PREPARATION  ***\n`);
  await setupEserviceTable(db);
};

export const dataPreparationCleanup = async (db: DB): Promise<void> => {
  // console.info("\n*** SIGNALHUB DATA PREPARATION CLEANUP ***\n");
  await db.none("truncate eservice;");
};

export const deleteAllSqsMessages = async (
  sqsClient: SQS.SQSClient,
  queueUrl: string
): Promise<void> => {
  // console.info(
  //   "\n*** SIGNALHUB DATA PREPARATION DELETE ALL QUEUE MESSAGES ***\n"
  // );
  await SQS.deleteBatchMessages(sqsClient, queueUrl);
};
