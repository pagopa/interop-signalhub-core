import { apiClient } from "../../client.js";
import { getAuthorizationHeader } from "../../utils/index.js";

export const getAgreementsEventsFromId = async (
  voucher: string,
  lastEventId: number
) => {
  return await apiClient.events.getAgreementsEventsFromId(
    {
      lastEventId: lastEventId,
      limit: 500,
    },
    getAuthorizationHeader(voucher)
  );
};
