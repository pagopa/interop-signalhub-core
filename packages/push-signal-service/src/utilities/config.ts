import { z } from "zod";
import { SignalHubStoreEnv } from "../config/db.js";

const SignalHubStoreConfig = SignalHubStoreEnv;

export type SignalHubStoreConfig = z.infer<typeof SignalHubStoreConfig>;

export const config: SignalHubStoreConfig = {
  ...SignalHubStoreConfig.parse(process.env),
};
