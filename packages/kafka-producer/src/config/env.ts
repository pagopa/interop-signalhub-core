import { logLevel } from "kafkajs";
import { z } from "zod";
import { AwsConfig } from "pagopa-signalhub-commons";

export const KafkaProducerConfig = z
  .object({
    KAFKA_TOPIC: z.string(),
    KAFKA_BROKERS: z.string(),
    KAFKA_CLIENT_ID: z.string(),
    KAFKA_DISABLE_AWS_IAM_AUTH: z.literal("true").optional(),
    KAFKA_LOG_LEVEL: z
      .enum(["NOTHING", "ERROR", "WARN", "INFO", "DEBUG"])
      .default("WARN"),
    KAFKA_REAUTHENTICATION_THRESHOLD: z
      .number()
      .default(20)
      .transform((n) => n * 1000),
  })
  .and(AwsConfig)
  .transform((c) => ({
    awsRegion: c.awsRegion,
    kafkaBrokers: c.KAFKA_BROKERS,
    kafkaClientId: c.KAFKA_CLIENT_ID,
    kafkaDisableAwsIamAuth: c.KAFKA_DISABLE_AWS_IAM_AUTH === "true",
    kafkaLogLevel: logLevel[c.KAFKA_LOG_LEVEL],
    kafkaReauthenticationThreshold: c.KAFKA_REAUTHENTICATION_THRESHOLD,
    kafkaTopic: c.KAFKA_TOPIC,
  }));

const parsedFromEnv = KafkaProducerConfig.safeParse(process.env);
if (!parsedFromEnv.success) {
  const invalidEnvVars = parsedFromEnv.error.issues.flatMap(
    (issue) => issue.path
  );
  // eslint-disable-next-line no-console
  console.error(
    "Invalid or missing env vars: Kafka Producer " + invalidEnvVars.join(", ")
  );
  process.exit(1);
}

export const config: KafkaProducerConfig = {
  ...parsedFromEnv.data,
};

export type KafkaProducerConfig = z.infer<typeof KafkaProducerConfig>;
