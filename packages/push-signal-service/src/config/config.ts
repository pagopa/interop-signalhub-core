import { z } from "zod";
import { SignalHubStoreConfig } from "./db.js";
import { SqsPersisterServiceConfig } from "./sqs.js";
import { HTTPServerConfig } from "signalhub-commons";

const PushServiceConfig = HTTPServerConfig.and(SignalHubStoreConfig).and(
  SqsPersisterServiceConfig
);

export type PushServiceConfig = z.infer<typeof PushServiceConfig>;

export const config: PushServiceConfig = {
  ...PushServiceConfig.parse(process.env),
};
