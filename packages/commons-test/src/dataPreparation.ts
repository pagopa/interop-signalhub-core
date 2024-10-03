import { DB, InteropSchema, SQS, TableName } from "pagopa-signalhub-commons";
import { signalProducer, eserviceProducer, signalConsumer } from "./common.js";
import {
  truncateAgreementTable,
  truncateEserviceTable,
  truncatePurposeTable,
} from "./databaseUtils.js";

async function setupEserviceTable(
  db: DB,
  schema: InteropSchema
): Promise<void> {
  const allProducers = [signalProducer, eserviceProducer];

  const eserviceTable: TableName = `${schema}.eservice`;
  for (const producer of allProducers) {
    const { id, eservices } = producer;
    for (const eservice of eservices) {
      const query = {
        text: `INSERT INTO ${eserviceTable} (eservice_id, producer_id, descriptor_id, state) values ($1, $2, $3, $4)`,
        values: [eservice.id, id, eservice.descriptor, eservice.state],
      };
      await db.none(query);
    }
  }
}
async function setupPurposeTableForProducers(
  db: DB,
  schema: InteropSchema
): Promise<void> {
  const producers = [signalProducer, eserviceProducer];

  const purposeTable: TableName = `${schema}.purpose`;
  for (const producer of producers) {
    const { id: consumerId, purposes } = producer;
    for (const purpose of purposes.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (e: any) => !("skip_insert" in e)
    )) {
      const { state, version, eservice, id } = purpose;

      const query = {
        text: `INSERT INTO ${purposeTable}(purpose_id, purpose_version_id, purpose_state, eservice_id, consumer_id) values ($1, $2, $3, $4, $5)`,
        values: [id, version, state, eservice, consumerId],
      };
      await db.none(query);
    }
  }
}

async function setupPurposeTableForConsumers(
  db: DB,
  schema: InteropSchema
): Promise<void> {
  const { id: consumerId, purposes } = signalConsumer;
  const purposeTable: TableName = `${schema}.purpose`;
  for (const purpose of purposes.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => !("skip_insert" in e)
  )) {
    const { id, version, state, eservice } = purpose;

    const query = {
      text: `INSERT INTO ${purposeTable} (purpose_id, purpose_version_id, purpose_state, eservice_id, consumer_id) values ($1, $2, $3, $4, $5)`,
      values: [id, version, state, eservice, consumerId],
    };
    await db.none(query);
  }
}

async function setupAgreementTable(
  db: DB,
  schema: InteropSchema
): Promise<void> {
  const { id, agreements } = signalConsumer;
  const agreementTable: TableName = `${schema}.agreement`;
  for (const agreement of agreements.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => !("skip_insert" in e)
  )) {
    const query = {
      text: `INSERT INTO ${agreementTable} (agreement_id, eservice_id, consumer_id, descriptor_id,state) values ($1, $2, $3, $4, $5)`,
      values: [
        agreement.id,
        agreement.eservice,
        id,
        agreement.descriptor,
        agreement.state,
      ],
    };
    await db.none(query);
  }
}

// TODO: to delete
export const dataPreparation = async (
  db: DB,
  schema: InteropSchema
): Promise<void> => {
  await setupEserviceTable(db, schema);
  await setupAgreementTable(db, schema);
};
// TODO: to delete
export const dataPreparationCleanup = async (
  db: DB,
  schema: InteropSchema
): Promise<void> => {
  await truncateEserviceTable(db, schema);
  await truncateAgreementTable(db, schema);
};

export const dataPreparationForSignalProducers = async (
  db: DB,
  schema: InteropSchema
): Promise<void> => {
  await setupEserviceTable(db, schema);
  await setupPurposeTableForProducers(db, schema);
};

export const dataPreparationForSignalConsumers = async (
  db: DB,
  schema: InteropSchema
): Promise<void> => {
  await setupAgreementTable(db, schema);
  await setupPurposeTableForConsumers(db, schema);
};

export const dataResetForSignalProducers = async (
  db: DB,
  schema: InteropSchema
): Promise<void> => {
  await truncateEserviceTable(db, schema);
  await truncatePurposeTable(db, schema);
};

export const dataResetForSignalConsumers = async (
  db: DB,
  schema: InteropSchema
): Promise<void> => {
  await truncateAgreementTable(db, schema);
  await truncatePurposeTable(db, schema);
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
