import { Api } from "./api/gateway.models.js";
import { config } from "./config/interop-client.config.js";

export const apiClient = new Api({
  baseURL: config.gatewayUrl,
});
