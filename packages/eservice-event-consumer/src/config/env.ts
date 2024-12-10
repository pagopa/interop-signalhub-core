import {
  KafkaConsumerConfig,
  KafkaTopicConfig,
  SignalHubStoreConfig
} from "pagopa-signalhub-commons";
import { z } from "zod";

const EserviceEventConsumerConfig =
  KafkaConsumerConfig.and(KafkaTopicConfig).and(SignalHubStoreConfig);

export type EserviceEventConsumerConfig = z.infer<
  typeof EserviceEventConsumerConfig
>;
const parsedFromEnv = EserviceEventConsumerConfig.safeParse(process.env);

if (!parsedFromEnv.success) {
  const invalidEnvVars = parsedFromEnv.error.issues.flatMap(
    (issue) => issue.path
  );
  console.error(
    `Invalid or missing env vars: Eservice Event Consumer ${invalidEnvVars.join(", ")}`
  );
  process.exit(1);
}

export const config: EserviceEventConsumerConfig = {
  ...parsedFromEnv.data
};
