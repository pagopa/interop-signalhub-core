/* eslint-disable no-constant-condition */
import {
  SQSClient,
  ReceiveMessageCommand,
  SendMessageCommand,
  DeleteMessageCommand,
  Message,
  SQSClientConfig,
  SendMessageCommandInput,
  DeleteMessageBatchCommand,
  ReceiveMessageCommandOutput,
} from "@aws-sdk/client-sqs";
import { Logger } from "../logging/index.js";
import { QuequeConsumerConfig } from "../config/queque.consumer.js";

export const instantiateClient = (config: SQSClientConfig): SQSClient =>
  new SQSClient(config);

export const runConsumer = async (
  sqsClient: SQSClient,
  config: {
    queueUrl: string;
    runUntilQueueIsEmpty?: boolean;
  } & QuequeConsumerConfig,
  consumerHandler: (messagePayload: Message) => Promise<void>,
  loggerInstance: Logger
): Promise<void> => {
  loggerInstance.info(`Consumer processing on Queue: ${config.queueUrl}`);
  try {
    await processQueue(sqsClient, config, consumerHandler, loggerInstance);
  } catch (e) {
    loggerInstance.error(
      `Generic error occurs processing Queue: ${
        config.queueUrl
      }. Details: ${serializeError(e)}`
    );
    await processExit(1, loggerInstance);
  }
  loggerInstance.info(
    `Queue processing Completed for Queue: ${config.queueUrl}`
  );
};

const processQueue = async (
  sqsClient: SQSClient,
  config: {
    queueUrl: string;
    runUntilQueueIsEmpty?: boolean;
  } & QuequeConsumerConfig,
  consumerHandler: (messagePayload: Message) => Promise<void>,
  loggerInstance: Logger
): Promise<void> => {
  const command = new ReceiveMessageCommand({
    QueueUrl: config.queueUrl,
    WaitTimeSeconds: 10,
    MaxNumberOfMessages: 10,
  });

  // eslint-disable-next-line functional/no-let
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
              message.ReceiptHandle,
              loggerInstance
            );
          } catch (error) {
            loggerInstance.warn(
              `Generated error: message will remain on queue, error ${error}`
            );
          }
        }
      }
    } while (keepProcessingQueue);
  } catch (error) {
    loggerInstance.error(`Error on queue ${error}`);
  }
};

export const sendMessage = async (
  sqsClient: SQSClient,
  queueUrl: string,
  messageBody: string,
  loggerInstance: Logger
): Promise<void> => {
  const messageCommandInput: SendMessageCommandInput = {
    QueueUrl: queueUrl,
    MessageBody: messageBody,
  };
  const command = new SendMessageCommand(messageCommandInput);
  await sqsClient.send(command);
  loggerInstance.info(`SQS Client::sendMessage, message sent`);
};

export const deleteMessage = async (
  sqsClient: SQSClient,
  queueUrl: string,
  receiptHandle: string,
  loggerInstance: Logger
): Promise<void> => {
  const deleteCommand = new DeleteMessageCommand({
    QueueUrl: queueUrl,
    ReceiptHandle: receiptHandle,
  });
  loggerInstance.info("Deleting message from queue");
  await sqsClient.send(deleteCommand);
};

export const deleteBatchMessages = async (
  sqsClient: SQSClient,
  queueUrl: string
): Promise<void> => {
  const receiveMessage = (
    queueUrl: string
  ): Promise<ReceiveMessageCommandOutput> =>
    sqsClient.send(
      new ReceiveMessageCommand({
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 10,
        QueueUrl: queueUrl,
      })
    );

  const { Messages } = await receiveMessage(queueUrl);

  if (!Messages) {
    return;
  }

  if (Messages.length === 1) {
    await sqsClient.send(
      new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: Messages[0].ReceiptHandle,
      })
    );
  } else {
    await sqsClient.send(
      new DeleteMessageBatchCommand({
        QueueUrl: queueUrl,
        Entries: Messages.map((message) => ({
          Id: message.MessageId,
          ReceiptHandle: message.ReceiptHandle,
        })),
      })
    );
  }
};

const serializeError = (error: unknown): string => {
  try {
    return JSON.stringify(error, Object.getOwnPropertyNames(error));
  } catch (e) {
    return `${error}`;
  }
};

const processExit = async (
  exitStatusCode: number = 1,
  loggerInstance: Logger
): Promise<void> => {
  loggerInstance.error(`Process exit with code ${exitStatusCode}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  process.exit(exitStatusCode);
};

export { SQSClient, SQSClientConfig, Message };
