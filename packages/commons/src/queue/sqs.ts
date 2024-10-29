/* eslint-disable no-constant-condition */
import {
  DeleteMessageBatchCommand,
  DeleteMessageCommand,
  Message,
  ReceiveMessageCommand,
  ReceiveMessageCommandOutput,
  SQSClient,
  SQSClientConfig,
  SendMessageCommand,
  SendMessageCommandInput,
} from "@aws-sdk/client-sqs";

import { QuequeConsumerConfig } from "../config/queque.consumer.js";
import { Logger } from "../logging/index.js";
export const instantiateClient = (config: SQSClientConfig): SQSClient =>
  new SQSClient(config);

export const runConsumer = async (
  sqsClient: SQSClient,
  config: {
    queueUrl: string;
    runUntilQueueIsEmpty?: boolean;
  } & QuequeConsumerConfig,
  consumerHandler: (messagePayload: Message) => Promise<void>,
  loggerInstance: Logger,
): Promise<void> => {
  loggerInstance.info(`Consumer processing on queue: ${config.queueUrl}`);
  try {
    await processQueue(sqsClient, config, consumerHandler, loggerInstance);
  } catch (e) {
    loggerInstance.error(
      `Consumer exit: generic error occurs processing queue: ${
        config.queueUrl
      }. Details: ${serializeError(e)}`,
    );
    await processExit();
  }
  loggerInstance.info(
    `Consumer ended: processing completed for queue: ${config.queueUrl}`,
  );
};

const processQueue = async (
  sqsClient: SQSClient,
  config: {
    queueUrl: string;
    runUntilQueueIsEmpty?: boolean;
  } & QuequeConsumerConfig,
  consumerHandler: (messagePayload: Message) => Promise<void>,
  loggerInstance: Logger,
): Promise<void> => {
  loggerInstance.info(`Processing queue starting`);
  const command = new ReceiveMessageCommand({
    MaxNumberOfMessages: 10,
    QueueUrl: config.queueUrl,
    WaitTimeSeconds: 10,
  });

  let keepProcessingQueue = true;

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
              `ReceiptHandle not found in Message: ${JSON.stringify(message)}`,
            );
          }
          try {
            await consumerHandler(message);
            await deleteMessage(
              sqsClient,
              config.queueUrl,
              message,
              loggerInstance,
            );
          } catch (error) {
            loggerInstance.warn(
              `Processing queue, message not processed: it will remain on queue, error: ${error}`,
            );
          }
        }
      }
    } while (keepProcessingQueue);
  } catch (error) {
    loggerInstance.error(`Processing queue error: ${error}`);
  }
};

export const sendMessage = async (
  sqsClient: SQSClient,
  queueUrl: string,
  messageBody: string,
  loggerInstance: Logger,
): Promise<void> => {
  const messageCommandInput: SendMessageCommandInput = {
    MessageBody: messageBody,
    QueueUrl: queueUrl,
  };
  const command = new SendMessageCommand(messageCommandInput);
  const result = await sqsClient.send(command);
  loggerInstance.debug(
    `SQS Client::sendMessage, sent messageId ${result.MessageId}`,
  );
};

export const deleteMessage = async (
  sqsClient: SQSClient,
  queueUrl: string,
  messagePayload: Message,
  loggerInstance: Logger,
): Promise<void> => {
  const { Body, ReceiptHandle } = messagePayload;
  const correlationId = Body && (JSON.parse(Body).correlationId as unknown);
  const deleteCommand = new DeleteMessageCommand({
    QueueUrl: queueUrl,
    ReceiptHandle,
  });
  loggerInstance.info(`[CID=${correlationId}] Deleting message from queue`);
  await sqsClient.send(deleteCommand);
};

export const deleteBatchMessages = async (
  sqsClient: SQSClient,
  queueUrl: string,
): Promise<void> => {
  const receiveMessage = (
    queueUrl: string,
  ): Promise<ReceiveMessageCommandOutput> =>
    sqsClient.send(
      new ReceiveMessageCommand({
        MaxNumberOfMessages: 10,
        QueueUrl: queueUrl,
        WaitTimeSeconds: 10,
      }),
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
      }),
    );
  } else {
    await sqsClient.send(
      new DeleteMessageBatchCommand({
        Entries: Messages.map((message) => ({
          Id: message.MessageId,
          ReceiptHandle: message.ReceiptHandle,
        })),
        QueueUrl: queueUrl,
      }),
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

const processExit = async (exitStatusCode = 1): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  process.exit(exitStatusCode);
};

export { Message, SQSClient, SQSClientConfig };
