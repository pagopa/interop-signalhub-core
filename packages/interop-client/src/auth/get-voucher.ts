import axios, { AxiosResponse } from "axios";
import { config } from "../config/env.js";

export async function getVoucher(assertion: string): Promise<string> {
  try {
    const urlAuth: string = config.urlAuthToken;
    const formData = new URLSearchParams();

    const assertionType =
      "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";

    formData.append("client_id", config.clientId);
    formData.append("grant_type", "client_credentials");
    formData.append("client_assertion", assertion);
    formData.append("client_assertion_type", assertionType);

    const { data }: AxiosResponse<{ access_token: string }> = await axios.post(
      urlAuth,
      formData
    );

    return data.access_token;
  } catch (error) {
    throw error;
  }
}
