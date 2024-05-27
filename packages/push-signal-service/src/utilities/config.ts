import { z } from "zod";
import { SignalHubStoreConfig } from "../config/db.js";
import { HTTPServerConfig } from "signalhub-commons";

const PushServiceConfig = HTTPServerConfig.and(SignalHubStoreConfig);

export type PushServiceConfig = z.infer<typeof PushServiceConfig>;

export const config: PushServiceConfig = {
  ...PushServiceConfig.parse(process.env),
};
