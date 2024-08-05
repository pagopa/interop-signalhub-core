import { generateAuthToken } from "aws-msk-iam-sasl-signer-js";
import {
  Consumer,
  Kafka,
  KafkaConfig,
  OauthbearerProviderResponse,
  Producer,
  ProducerRecord,
  RecordMetadata,
  logLevel,
} from "kafkajs";
import { Logger, genericLogger } from "pagopa-signalhub-commons";
import { P, match } from "ts-pattern";
import { KafkaProducerConfig } from "./config/env.js";

const errorTypes = ["unhandledRejection", "uncaughtException"];
const signalTraps = ["SIGTERM", "SIGINT", "SIGUSR2"];

const processExit = (existStatusCode: number = 1): void => {
  genericLogger.debug(`Process exit with code ${existStatusCode}`);
  process.exit(existStatusCode);
};

const errorEventsListener = (consumerOrProducer: Consumer | Producer): void => {
  errorTypes.forEach((type) => {
    process.on(type, async (e) => {
      try {
        genericLogger.error(`Error ${type} intercepted; Error detail: ${e}`);
        await consumerOrProducer.disconnect().finally(() => {
          genericLogger.debug("Disconnected successfully");
        });
        processExit();
      } catch (e) {
        genericLogger.error(
          `Unexpected error on disconnection with event type ${type}; Error detail: ${e}`
        );
        processExit();
      }
    });
  });

  signalTraps.forEach((type) => {
    process.once(type, async () => {
      try {
        await consumerOrProducer.disconnect().finally(() => {
          genericLogger.debug("Disconnected successfully");
          processExit();
        });
      } finally {
        process.kill(process.pid, type);
      }
    });
  });
};

const producerKafkaEventsListener = (producer: Producer): void => {
  if (genericLogger.isDebugEnabled()) {
    producer.on(producer.events.DISCONNECT, () => {
      genericLogger.debug(`Producer has disconnected.`);
    });
  }
  // eslint-disable-next-line sonarjs/no-identical-functions
  producer.on(producer.events.REQUEST_TIMEOUT, (e) => {
    genericLogger.error(
      `Error Request to a broker has timed out : ${JSON.stringify(e)}.`
    );
  });
};

async function oauthBearerTokenProvider(
  region: string,
  logger: Logger
): Promise<OauthbearerProviderResponse> {
  logger.debug("Fetching token from AWS");

  const authTokenResponse = await generateAuthToken({
    region,
  });

  logger.debug(
    `Token fetched from AWS expires at ${authTokenResponse.expiryTime}`
  );

  return {
    value: authTokenResponse.token,
  };
}

const initKafka = (config: KafkaProducerConfig): Kafka => {
  const kafkaConfig: KafkaConfig = config.kafkaDisableAwsIamAuth
    ? {
        clientId: config.kafkaClientId,
        brokers: [config.kafkaBrokers],
        logLevel: config.kafkaLogLevel,
        ssl: false,
      }
    : {
        clientId: config.kafkaClientId,
        brokers: [config.kafkaBrokers],
        logLevel: config.kafkaLogLevel,
        reauthenticationThreshold: config.kafkaReauthenticationThreshold,
        ssl: true,
        sasl: {
          mechanism: "oauthbearer",
          oauthBearerProvider: () =>
            oauthBearerTokenProvider(config.awsRegion!, genericLogger),
        },
      };

  return new Kafka({
    ...kafkaConfig,
    logCreator:
      (_logLevel) =>
      ({ level, log }) => {
        const { message, error } = log;

        const filteredLevel = match(error)
          .with(
            P.string,
            (error) =>
              (level === logLevel.ERROR || level === logLevel.WARN) &&
              error.includes("The group is rebalancing, so a rejoin is needed"),
            () => logLevel.INFO
          )
          .otherwise(() => level);

        // eslint-disable-next-line sonarjs/no-nested-template-literals
        const msg = `${message}${error ? ` - ${error}` : ""}`;

        match(filteredLevel)
          .with(logLevel.NOTHING, logLevel.ERROR, () =>
            genericLogger.error(msg)
          )
          .with(logLevel.WARN, () => genericLogger.warn(msg))
          .with(logLevel.INFO, () => genericLogger.info(msg))
          .with(logLevel.DEBUG, () => genericLogger.debug(msg))
          .otherwise(() => genericLogger.error(msg));
      },
  });
};

export const initProducer = async (
  config: KafkaProducerConfig,
  topic: string
): Promise<
  Producer & {
    send: (record: Omit<ProducerRecord, "topic">) => Promise<RecordMetadata[]>;
  }
> => {
  try {
    const kafka = initKafka(config);

    const producer = kafka.producer({
      allowAutoTopicCreation: false,
      retry: {
        initialRetryTime: 100,
        maxRetryTime: 3000,
        retries: 3,
        restartOnFailure: (error) => {
          genericLogger.error(`Error during restart service: ${error.message}`);
          return Promise.resolve(false);
        },
      },
    });

    producerKafkaEventsListener(producer);
    errorEventsListener(producer);

    await producer.connect();

    genericLogger.debug("Producer connected");

    const topicExists = await validateTopicMetadata(kafka, [topic]);
    if (!topicExists) {
      processExit();
    }

    return {
      ...producer,
      send: async (record: Omit<ProducerRecord, "topic">) =>
        await producer.send({
          ...record,
          topic,
        }),
    };
  } catch (e) {
    genericLogger.error(
      `Generic error occurs during consumer initialization: ${e}`
    );
    processExit();
    return undefined as never;
  }
};

export const validateTopicMetadata = async (
  kafka: Kafka,
  topicNames: string[]
): Promise<boolean> => {
  genericLogger.debug(
    `Check topics |${JSON.stringify(topicNames)}| existence...`
  );

  const admin = kafka.admin();
  await admin.connect();

  try {
    const { topics } = await admin.fetchTopicMetadata({
      topics: [...topicNames],
    });
    genericLogger.debug(`Topic metadata: ${JSON.stringify(topics)} `);
    await admin.disconnect();
    return true;
  } catch (e) {
    await admin.disconnect();
    genericLogger.error(
      `Unable to subscribe! Error during topic metadata fetch: ${JSON.stringify(
        e
      )}`
    );
    return false;
  }
};
