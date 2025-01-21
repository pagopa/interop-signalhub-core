import {
  KafkaConsumerConfig,
  KafkaTopicConfig,
  SignalHubStoreConfig
} from "pagopa-signalhub-commons";
import { z } from "zod";

const DelegationEventConsumerConfig =
  KafkaConsumerConfig.and(KafkaTopicConfig).and(SignalHubStoreConfig);

export type DelegationEventConsumerConfig = z.infer<
  typeof DelegationEventConsumerConfig
>;

const parsedFromEnv = DelegationEventConsumerConfig.safeParse(process.env);

if (!parsedFromEnv.success) {
  const invalidEnvVars = parsedFromEnv.error.issues.flatMap(
    (issue) => issue.path
  );

  console.error(
    `Invalid or missing env vars: Delegation Event Consumer ${invalidEnvVars.join(", ")}`
  );
  process.exit(1);
}

export const config: DelegationEventConsumerConfig = {
  ...parsedFromEnv.data
};
