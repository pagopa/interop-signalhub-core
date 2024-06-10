// import axios, { AxiosResponse } from "axios";
import { InteropClientConfig } from "./config/interop-client.config.js";

export async function obtainVoucher(
  config: InteropClientConfig,
  assertion: string
): Promise<string> {
  try {
    const urlAuth: string = config.urlAuthToken;
    const formData = new URLSearchParams();

    const assertionType =
      "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";

    formData.append("client_id", config.clientId);
    formData.append("grant_type", "client_credentials");
    formData.append("client_assertion", assertion);
    formData.append("client_assertion_type", assertionType);

    const response = await fetch(urlAuth, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        accept: "application/json",
      },
      body: formData,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await response.json();
    if (response.status >= 400) {
      throw Error(
        `Something went wrong: ${JSON.stringify(data ?? response.statusText)}`
      );
    }
    return data.access_token;

    // return response.data.access_token;
  } catch (error) {
    console.error("errore axios", error);
    throw error;
  }
}
