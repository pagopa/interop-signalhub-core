import { DB, SQS } from "signalhub-commons";
import { signalProducer, eserviceProducer, signalConsumer } from "./common.js";

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
      await db.oneOrNone(query);
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
    await db.oneOrNone(query);
  }
}

export const dataPreparation = async (db: DB): Promise<void> => {
  // console.info(`\n*** SIGNALHUB DATA PREPARATION  ***\n`);
  await setupEserviceTable(db);
  await setupConsumerEserviceTable(db);
};

export const dataPreparationCleanup = async (db: DB): Promise<void> => {
  // console.info("\n*** SIGNALHUB DATA PREPARATION CLEANUP ***\n");
  await db.none("truncate DEV_INTEROP.eservice;");
  await db.none("truncate DEV_INTEROP.consumer_eservice;");
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
