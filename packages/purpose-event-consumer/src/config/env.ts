import {
  KafkaConsumerConfig,
  PurposeTopicConfig,
  SignalHubStoreConfig,
} from "pagopa-signalhub-commons";
import { z } from "zod";

const PurposeEventConsumerConfig =
  KafkaConsumerConfig.and(PurposeTopicConfig).and(SignalHubStoreConfig);

export type PurposeEventConsumerConfig = z.infer<
  typeof PurposeEventConsumerConfig
>;
const parsedFromEnv = PurposeEventConsumerConfig.safeParse(process.env);

if (!parsedFromEnv.success) {
  const invalidEnvVars = parsedFromEnv.error.issues.flatMap(
    (issue) => issue.path
  );
  // eslint-disable-next-line no-console
  console.error(
    "Invalid or missing env vars: Purpose Event Consumer " +
      invalidEnvVars.join(", ")
  );
  process.exit(1);
}

export const config: PurposeEventConsumerConfig = {
  ...parsedFromEnv.data,
};
