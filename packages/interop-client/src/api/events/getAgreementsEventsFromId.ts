import { apiClient } from "../../client.js";
import { getAuthorizationHeader } from "../../utils/index.js";

export const getAgreementsEventsFromId = async (
  voucher: string,
  lastEventId: number
) =>
  await apiClient.events.getAgreementsEventsFromId(
    {
      lastEventId,
      limit: 500,
    },
    getAuthorizationHeader(voucher)
  );
