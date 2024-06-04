import { z } from "zod";
import { SignalHubStoreConfig } from "./db.js";
import { QuequeConfig } from "./queque.js";
import { HTTPServerConfig } from "signalhub-commons";

const PushServiceConfig =
  HTTPServerConfig.and(SignalHubStoreConfig).and(QuequeConfig);

export type PushServiceConfig = z.infer<typeof PushServiceConfig>;

export const config: PushServiceConfig = {
  ...PushServiceConfig.parse(process.env),
};
