import { randomUUID } from "crypto";

const formatDate = (date: Date): { day: string; time: string } => {
  const isoDate = date.toISOString();
  return {
    day: isoDate.slice(0, 10).replaceAll("-", ""),
    time: isoDate.slice(11, 19).replaceAll(":", "")
  };
};

export function arrayToNdjson(array: unknown[]): string {
  return array.map((item) => JSON.stringify(item)).join("\n") + "\n";
}

export function getDataCountBucketKey(date: Date): string {
  const { day, time } = formatDate(date);
  return `count/signal/${day}/${day}_${time}.json`;
}

export function getNdjsonBucketKey(date: Date): string {
  const { day, time } = formatDate(date);
  return `data/signal/${day}/${day}_${time}_${randomUUID()}.ndjson`;
}

export function splitArrayIntoChunks<T>(array: T[], chunkSize: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / chunkSize) }, (_, i) =>
    array.slice(i * chunkSize, (i + 1) * chunkSize)
  );
}
