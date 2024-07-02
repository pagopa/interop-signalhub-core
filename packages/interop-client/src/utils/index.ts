import { getClientAssertion } from "../auth/get-client-assertion.js";
import { getVoucher } from "../auth/get-voucher.js";

export function getAuthorizationHeader(token: string): {
  headers: { Authorization: string };
} {
  return { headers: { Authorization: "Bearer " + token } } as const;
}

export async function getAccessToken(): Promise<string> {
  const clientAssertion = await getClientAssertion();

  console.log("clientAssertion: ", clientAssertion);
  return await getVoucher(clientAssertion);
}
