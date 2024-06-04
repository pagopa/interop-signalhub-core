/* eslint-disable no-constant-condition */
import {
  SQSClient,
  ReceiveMessageCommand,
  SendMessageCommand,
  DeleteMessageCommand,
  Message,
  SQSClientConfig,
  SendMessageCommandInput,
  GetQueueUrlCommand,
} from "@aws-sdk/client-sqs";
import { logger } from "../logging/index.js";
import { QuequeConsumerConfig } from "../config/queque.consumer.js";

const loggerInstance = logger({});

const serializeError = (error: unknown): string => {
  try {
    return JSON.stringify(error, Object.getOwnPropertyNames(error));
  } catch (e) {
    return `${error}`;
  }
};

const processExit = async (exitStatusCode: number = 1): Promise<void> => {
  loggerInstance.error(`Process exit with code ${exitStatusCode}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  process.exit(exitStatusCode);
};

export const instantiateClient = (config: SQSClientConfig): SQSClient => {
  const sqsClient = new SQSClient({
    endpoint: config.endpoint,
    region: config.region,
  });
  return sqsClient;
};

const processQueue = async (
  sqsClient: SQSClient,
  config: {
    queueUrl: string;
    runUntilQueueIsEmpty?: boolean;
  } & QuequeConsumerConfig,
  consumerHandler: (messagePayload: Message) => Promise<void>
): Promise<void> => {
  const command = new ReceiveMessageCommand({
    QueueUrl: config.queueUrl,
    WaitTimeSeconds: 10,
    MaxNumberOfMessages: 10,
  });

  let keepProcessingQueue: boolean = true;

  try {
    do {
      const { Messages } = await sqsClient.send(command);

      if (
        config.runUntilQueueIsEmpty &&
        (!Messages || Messages?.length === 0)
      ) {
        keepProcessingQueue = false;
      }

      if (Messages?.length) {
        for (const message of Messages) {
          if (!message.ReceiptHandle) {
            throw new Error(
              `ReceiptHandle not found in Message: ${JSON.stringify(message)}`
            );
          }
          try {
            await consumerHandler(message);
            await deleteMessage(
              sqsClient,
              config.queueUrl,
              message.ReceiptHandle
            );
          } catch (error) {
            loggerInstance.info(`Generated error message will remain on queue`);
          }
        }
      }
    } while (keepProcessingQueue);
  } catch (error) {
    loggerInstance.error(`Errore on queue ${error}`);
  }
};

export const runConsumer = async (
  sqsClient: SQSClient,
  config: {
    queueUrl: string;
    runUntilQueueIsEmpty?: boolean;
  } & QuequeConsumerConfig,
  consumerHandler: (messagePayload: Message) => Promise<void>
): Promise<void> => {
  loggerInstance.info(`Consumer processing on Queue: ${config.queueUrl}`);

  try {
    await processQueue(sqsClient, config, consumerHandler);
  } catch (e) {
    loggerInstance.error(
      `Generic error occurs processing Queue: ${
        config.queueUrl
      }. Details: ${serializeError(e)}`
    );

    await processExit();
  }

  loggerInstance.info(
    `Queue processing Completed for Queue: ${config.queueUrl}`
  );
};

export const getQueueUrl = async (
  sqsClient: SQSClient,
  queueName: string
): Promise<string> => {
  const queueUrlCommand = {
    QueueName: queueName,
  };
  try {
    const command = new GetQueueUrlCommand(queueUrlCommand);
    const response = await sqsClient.send(command);
    return response.QueueUrl!;
  } catch (error) {
    console.log(error);
  }
  return "";
};

export const sendMessage = async (
  sqsClient: SQSClient,
  queueUrl: string,
  messageBody: string
): Promise<void> => {
  const messageCommandInput: SendMessageCommandInput = {
    QueueUrl: queueUrl,
    MessageBody: messageBody,
  };
  const command = new SendMessageCommand(messageCommandInput);
  await sqsClient.send(command);
};

export const deleteMessage = async (
  sqsClient: SQSClient,
  queueUrl: string,
  receiptHandle: string
): Promise<void> => {
  const deleteCommand = new DeleteMessageCommand({
    QueueUrl: queueUrl,
    ReceiptHandle: receiptHandle,
  });

  loggerInstance.info("Delete message from queue");
  await sqsClient.send(deleteCommand);
};

export { SQSClient, SQSClientConfig, Message };
