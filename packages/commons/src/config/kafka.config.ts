import { z } from "zod";
import { logLevel } from "kafkajs";
import { AwsConfig } from "./aws.config.js";
const KafkaConfig = z
  .object({
    KAFKA_BROKERS: z
      .string()
      .transform((s) => s.split(","))
      .pipe(z.array(z.string())),
    KAFKA_CLIENT_ID: z.string(),
    KAFKA_GROUP_ID: z.string(),
    KAFKA_DISABLE_AWS_IAM_AUTH: z.literal("true").optional(),
    KAFKA_LOG_LEVEL: z
      .enum(["NOTHING", "ERROR", "WARN", "INFO", "DEBUG"])
      .default("WARN"),
    KAFKA_REAUTHENTICATION_THRESHOLD: z
      .number()
      .default(20)
      .transform((n) => n * 1000),
  })
  .transform((c) => ({
    kafkaBrokers: c.KAFKA_BROKERS,
    kafkaClientId: c.KAFKA_CLIENT_ID,
    kafkaGroupId: c.KAFKA_GROUP_ID,
    kafkaDisableAwsIamAuth: c.KAFKA_DISABLE_AWS_IAM_AUTH === "true",
    kafkaLogLevel: logLevel[c.KAFKA_LOG_LEVEL],
    kafkaReauthenticationThreshold: c.KAFKA_REAUTHENTICATION_THRESHOLD,
  }));

export const KafkaConsumerConfig = KafkaConfig.and(AwsConfig).and(
  z
    .object({
      TOPIC_STARTING_OFFSET: z
        .union([z.literal("earliest"), z.literal("latest")])
        .default("latest"),
    })
    .transform((c) => ({
      topicStartingOffset: c.TOPIC_STARTING_OFFSET,
    }))
);
export type KafkaConsumerConfig = z.infer<typeof KafkaConsumerConfig>;

export const AgreementTopicConfig = z
  .object({
    AGREEMENT_TOPIC: z.string(),
  })
  .transform((c) => ({
    agreementTopic: c.AGREEMENT_TOPIC,
  }));
export type AgreementTopicConfig = z.infer<typeof AgreementTopicConfig>;

export const PurposeTopicConfig = z
  .object({
    PURPOSE_TOPIC: z.string(),
  })
  .transform((c) => ({
    purposeTopic: c.PURPOSE_TOPIC,
  }));
export type PurposeTopicConfig = z.infer<typeof PurposeTopicConfig>;
