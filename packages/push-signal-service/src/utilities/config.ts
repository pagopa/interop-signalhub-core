import { z } from "zod";
import { SignalHubStoreConfig } from "../config/db.js";
import { SqsPersisterServiceConfig } from "../config/sqs.js";
import { HTTPServerConfig } from "signalhub-commons";

const PushServiceConfig = HTTPServerConfig.and(SignalHubStoreConfig).and(
  SqsPersisterServiceConfig
);

export type PushServiceConfig = z.infer<typeof PushServiceConfig>;

export const config: PushServiceConfig = {
  ...PushServiceConfig.parse(process.env),
};
