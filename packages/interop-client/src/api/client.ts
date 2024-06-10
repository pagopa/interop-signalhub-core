import { Api } from "./gateway.models.js";
import { config } from "../config/env.js";

export const apiClient = new Api({
  baseURL: config.gatewayUrl,
});
