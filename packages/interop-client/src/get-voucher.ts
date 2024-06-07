import axios, { AxiosResponse } from "axios";
import { InteropClientConfig } from "./config/interop-client.config.js";

export async function obtainVoucher(
  config: InteropClientConfig,
  assertion: string
): Promise<string> {
  const urlAuth: string = config.urlAuthToken;
  const formData = new URLSearchParams();

  const assertionType =
    "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";

  formData.append("client_id", config.clientId ?? "");
  formData.append("grant_type", config.grantType ?? "");
  formData.append("client_assertion", assertion);
  formData.append("client_assertion_type", assertionType);

  const response: AxiosResponse<{ access_token: string }> = await axios.post(
    urlAuth,
    formData,
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        accept: "application/json",
      },
    }
  );

  return response.data.access_token;
}
