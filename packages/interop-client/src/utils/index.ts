import { getClientAssertion } from "../auth/get-client-assertion.js";
import { getVoucher } from "../auth/get-voucher.js";

export function getAuthorizationHeader(token: string) {
  return { headers: { Authorization: "Bearer " + token } } as const;
}

export async function getAccessToken() {
  const clientAssertion = await getClientAssertion();
  const voucher = await getVoucher(clientAssertion);

  return voucher;
}
