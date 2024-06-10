import { Api } from "./models/gateway.models.js";
import { config } from "./config/env.js";

export const apiClient = new Api({
  baseURL: config.gatewayUrl,
});
