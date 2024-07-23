import { KafkaConsumerConfig } from "pagopa-signalhub-commons";

const AgreementEventConsumerConfig = KafkaConsumerConfig;

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

export const config: KafkaConsumerConfig = {
  ...parsedFromEnv.data,
};
