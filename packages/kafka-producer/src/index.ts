import express from "express";
import agreementRouter from "./routes/agreement.js";
import eServiceRouter from "./routes/eservices.js";
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
    kafkaTopic: config.kafkaTopic,
  },
  config.kafkaTopic
);

app.use(express.json());
app.use("/agreement", agreementRouter);
app.use("/eservices", eServiceRouter);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(
    `Kafka-producer topic: ${config.kafkaTopic} listening on port: ${port}`
  );
});
