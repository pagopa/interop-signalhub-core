import {
  KafkaConsumerConfig,
  AgreementTopicConfig,
  SignalHubStoreConfig,
} from "pagopa-signalhub-commons";
import { z } from "zod";

const AgreementEventConsumerConfig =
  KafkaConsumerConfig.and(AgreementTopicConfig).and(SignalHubStoreConfig);

export type AgreementEventConsumerConfig = z.infer<
  typeof AgreementEventConsumerConfig
>;
const parsedFromEnv = AgreementEventConsumerConfig.safeParse(process.env);

if (!parsedFromEnv.success) {
  const invalidEnvVars = parsedFromEnv.error.issues.flatMap(
    (issue) => issue.path
  );
  // eslint-disable-next-line no-console
  console.error(
    "Invalid or missing env vars: Agreement Event Consumer " +
      invalidEnvVars.join(", ")
  );
  process.exit(1);
}

export const config: AgreementEventConsumerConfig = {
  ...parsedFromEnv.data,
};
