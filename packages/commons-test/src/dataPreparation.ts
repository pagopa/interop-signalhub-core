import { DB, SQS } from "pagopa-signalhub-commons";
import { signalProducer, eserviceProducer, signalConsumer } from "./common.js";
import {
  truncateConsumerEserviceTable,
  truncateEserviceTable,
} from "./databaseUtils.js";

async function setupEserviceTable(db: DB): Promise<void> {
  const allProducers = [signalProducer, eserviceProducer];
  // eslint-disable-next-line functional/no-let
  let count = 0;
  for (const producer of allProducers) {
    const { id, eservices } = producer;
    for (const eservice of eservices) {
      const query = {
        text: "INSERT INTO DEV_INTEROP.eservice (eservice_id, producer_id, descriptor_id, event_id, state) values ($1, $2, $3, $4, $5)",
        values: [eservice.id, id, eservice.descriptor, ++count, eservice.state],
      };
      await db.none(query);
    }
  }
}
async function setupConsumerEserviceTable(db: DB): Promise<void> {
  const { id, agreements } = signalConsumer;
  // eslint-disable-next-line functional/no-let
  let count = 0;
  for (const agreement of agreements.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => !("skip_insert" in e)
  )) {
    const query = {
      text: "INSERT INTO DEV_INTEROP.consumer_eservice (agreement_id, eservice_id, consumer_id, descriptor_id, event_id, state) values ($1, $2, $3, $4, $5,$6)",
      values: [
        agreement.id,
        agreement.eservice,
        id,
        agreement.descriptor,
        ++count,
        agreement.state,
      ],
    };
    await db.none(query);
  }
}

// TODO: to delete
export const dataPreparation = async (db: DB): Promise<void> => {
  await setupEserviceTable(db);
  await setupConsumerEserviceTable(db);
};
// TODO: to delete
export const dataPreparationCleanup = async (db: DB): Promise<void> => {
  await truncateEserviceTable(db);
  await truncateConsumerEserviceTable(db);
};

export const dataPreparationForSignalProducers = async (
  db: DB
): Promise<void> => {
  await setupEserviceTable(db);
};

export const dataPreparationForSignalConsumers = async (
  db: DB
): Promise<void> => {
  await setupConsumerEserviceTable(db);
};

export const dataResetForSignalProducers = async (db: DB): Promise<void> => {
  await truncateEserviceTable(db);
};

export const dataResetForSignalConsumers = async (db: DB): Promise<void> => {
  await truncateConsumerEserviceTable(db);
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
