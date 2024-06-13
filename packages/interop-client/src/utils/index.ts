export function getAuthorizationHeader(token: string): {
  headers: { Authorization: string };
} {
  return { headers: { Authorization: "Bearer " + token } } as const;
}
