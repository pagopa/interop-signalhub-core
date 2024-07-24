import { initProducer } from "./producer.js";
import { config } from "./config/env.js";
import {
  createFakeAgreementEvent,
  produceAgreementEvent,
} from "./agreement/index.js";

export const producer = await initProducer(
  {
    awsRegion: config.awsRegion,
    kafkaBrokers: config.kafkaBrokers,
    kafkaClientId: config.kafkaClientId,
    kafkaDisableAwsIamAuth: true,
    kafkaLogLevel: config.kafkaLogLevel,
    kafkaReauthenticationThreshold: config.kafkaReauthenticationThreshold,
  },
  "agreement"
);

const agreementEvent = createFakeAgreementEvent();

const message = produceAgreementEvent(agreementEvent);
await producer.send({
  messages: [{ value: message }],
});
