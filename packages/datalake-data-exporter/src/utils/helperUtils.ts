const getRunPrefix = (date: Date, runId: string): string =>
  `signal/dt=${date.toISOString().slice(0, 10)}/run=${runId}`;

export function arrayToNdjson(array: unknown[]): string {
  return array.map((item) => JSON.stringify(item)).join("\n") + "\n";
}

export function getManifestBucketKey(date: Date, runId: string): string {
  return `${getRunPrefix(date, runId)}/_manifest.json`;
}

export function getNdjsonBucketKey(
  date: Date,
  runId: string,
  fileNumber: number
): string {
  const paddedFileNumber = String(fileNumber).padStart(6, "0");
  return `${getRunPrefix(date, runId)}/part-${paddedFileNumber}.ndjson`;
}
