import { randomUUID } from "crypto";
import { DB, InteropSchema, SQS, TableName } from "pagopa-signalhub-commons";

import { eserviceProducer, signalConsumer, signalProducer } from "./common.js";
import {
  truncateAgreementTable,
  truncateEserviceTable,
  truncatePurposeTable,
} from "./databaseUtils.js";

async function setupEserviceTable(
  db: DB,
  schema: InteropSchema,
): Promise<void> {
  const allProducers = [signalProducer, eserviceProducer];

  const eserviceTable: TableName = `${schema}.eservice`;
  for (const producer of allProducers) {
    const { eservices, id } = producer;
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
  schema: InteropSchema,
): Promise<void> {
  const producers = [signalProducer, eserviceProducer];

  const purposeTable: TableName = `${schema}.purpose`;
  for (const producer of producers) {
    const { id: consumerId, purposes } = producer;
    for (const purpose of purposes.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (e: any) => !("skip_insert" in e),
    )) {
      const { eservice, id, state, version } = purpose;

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
  schema: InteropSchema,
): Promise<void> {
  const { id: consumerId, purposes } = signalConsumer;
  const purposeTable: TableName = `${schema}.purpose`;
  for (const purpose of purposes.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => !("skip_insert" in e),
  )) {
    const { eservice, id, state, version } = purpose;

    const query = {
      text: `INSERT INTO ${purposeTable} (purpose_id, purpose_version_id, purpose_state, eservice_id, consumer_id) values ($1, $2, $3, $4, $5)`,
      values: [id, version, state, eservice, consumerId],
    };
    await db.none(query);
  }
}

async function setupAgreementTable(
  db: DB,
  schema: InteropSchema,
): Promise<void> {
  const { agreements, id } = signalConsumer;
  const agreementTable: TableName = `${schema}.agreement`;
  for (const agreement of agreements.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => !("skip_insert" in e),
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
  schema: InteropSchema,
): Promise<void> => {
  await setupEserviceTable(db, schema);
  await setupAgreementTable(db, schema);
};

export type EserviceData = {
  descriptorId: string;
  eServiceId: string;
  enabledSH: boolean;
  producerId: string;
  state: string;
};

export function getAnEservice(
  eservice: Partial<EserviceData> = {},
): EserviceData {
  return {
    descriptorId: randomUUID(),
    eServiceId: randomUUID(),
    enabledSH: true,
    producerId: randomUUID(),
    state: "PUBLISHED",
    ...eservice,
  };
}
export const createEservice = async (
  db: DB,
  schema: InteropSchema,
  eService: Partial<EserviceData> = {},
): Promise<void> => {
  const eserviceTable: TableName = `${schema}.eservice`;
  const { descriptorId, eServiceId, enabledSH, producerId, state } = eService;
  const query = {
    text: `INSERT INTO ${eserviceTable} (eservice_id, producer_id, descriptor_id, state, enabled_signal_hub) values ($1, $2, $3, $4,$5)`,
    values: [eServiceId, producerId, descriptorId, state, enabledSH],
  };
  await db.none(query);
};

export type AgreementData = {
  consumerId: string;
  descriptorId: string;
  eserviceId: string;
  id: string;
  state: string;
};

export function getAnAgreement(
  agreement: Partial<AgreementData> = {},
): AgreementData {
  return {
    consumerId: randomUUID(),
    descriptorId: randomUUID(),
    eserviceId: randomUUID(),
    id: randomUUID(),
    state: "ACTIVE",
    ...agreement,
  };
}

export const createAgreement = async (
  db: DB,
  schema: InteropSchema,
  agreement: AgreementData,
): Promise<void> => {
  const agreementTable: TableName = `${schema}.agreement`;
  const { consumerId, descriptorId, eserviceId, id, state } = agreement;
  const query = {
    text: `INSERT INTO ${agreementTable} (agreement_id, eservice_id, consumer_id, descriptor_id,state) values ($1, $2, $3, $4, $5)`,
    values: [id, eserviceId, consumerId, descriptorId, state],
  };
  await db.none(query);
};

export type PurposeData = {
  consumerId: string;
  eserviceId: string;
  id: string;
  state: string;
  version: string;
};

export function getAPurpose(purpose: Partial<PurposeData> = {}): PurposeData {
  return {
    consumerId: randomUUID(),
    eserviceId: randomUUID(),
    id: randomUUID(),
    state: "ACTIVE",
    version: randomUUID(),
    ...purpose,
  };
}

export const createPurpose = async (
  db: DB,
  schema: InteropSchema,
  purpose: PurposeData,
): Promise<void> => {
  const purposeTable: TableName = `${schema}.purpose`;
  const { consumerId, eserviceId, id, state, version } = purpose;
  const query = {
    text: `INSERT INTO ${purposeTable} (purpose_id, purpose_version_id, purpose_state, eservice_id, consumer_id) values ($1, $2, $3, $4, $5)`,
    values: [id, version, state, eserviceId, consumerId],
  };
  await db.none(query);
};

export const createAdministrativeActsForConsumer = async (
  db: DB,
  schema: InteropSchema,
  eservice?: Partial<EserviceData>,
  agreement?: Partial<AgreementData>,
  purpose?: Partial<PurposeData>,
): Promise<void> => {
  if (eservice) {
    await createEservice(db, schema, getAnEservice(eservice));
  }
  if (agreement) {
    await createAgreement(db, schema, getAnAgreement(agreement));
  }
  if (purpose) {
    await createPurpose(db, schema, getAPurpose(purpose));
  }
};

// TODO: to delete
export const dataPreparationCleanup = async (
  db: DB,
  schema: InteropSchema,
): Promise<void> => {
  await truncateEserviceTable(db, schema);
  await truncateAgreementTable(db, schema);
};

export const dataPreparationForSignalProducers = async (
  db: DB,
  schema: InteropSchema,
): Promise<void> => {
  await setupEserviceTable(db, schema);
  await setupPurposeTableForProducers(db, schema);
};

// TODO: to delete
export const dataPreparationForSignalConsumers = async (
  db: DB,
  schema: InteropSchema,
): Promise<void> => {
  await setupAgreementTable(db, schema);
  await setupPurposeTableForConsumers(db, schema);
};

export const dataResetForSignalProducers = async (
  db: DB,
  schema: InteropSchema,
): Promise<void> => {
  await truncateEserviceTable(db, schema);
};

export const dataResetForSignalConsumers = async (
  db: DB,
  schema: InteropSchema,
): Promise<void> => {
  await truncateEserviceTable(db, schema);
  await truncateAgreementTable(db, schema);
  await truncatePurposeTable(db, schema);
};

export const deleteAllSqsMessages = async (
  sqsClient: SQS.SQSClient,
  queueUrl: string,
): Promise<void> => {
  // console.info(
  //   "\n*** SIGNALHUB DATA PREPARATION DELETE ALL QUEUE MESSAGES ***\n"
  // );
  await SQS.deleteBatchMessages(sqsClient, queueUrl);
};

export const getUUID = (): string => randomUUID();
