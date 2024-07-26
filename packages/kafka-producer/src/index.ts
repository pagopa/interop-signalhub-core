import express from "express";
import agreementRouter from "./routes/agreement.js";
import { config } from "./config/env.js";
import { initProducer } from "./producer.js";

const app = express();
const port = 3005;

export const producer = await initProducer(
  {
    awsRegion: config.awsRegion,
    kafkaBrokers: config.kafkaBrokers,
    kafkaClientId: config.kafkaClientId,
    kafkaDisableAwsIamAuth: true,
    kafkaLogLevel: config.kafkaLogLevel,
    kafkaReauthenticationThreshold: config.kafkaReauthenticationThreshold,
  },
  "agreement"
);

app.use("/agreement", agreementRouter);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Kafka-producer listening on port: ${port}`);
});
