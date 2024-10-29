/* eslint-disable @typescript-eslint/explicit-function-return-type */
import winston from "winston";

import { LoggerConfig } from "../config/index.js";
export interface LoggerMetadata {
  correlationId?: null | string;
  eserviceId?: string;
  eventType?: string;
  eventVersion?: number;
  organizationId?: string;
  purposeId?: string;
  serviceName?: string;
  streamId?: string;
  userId?: string;
  version?: number;
}

export const parsedLoggerConfig = LoggerConfig.safeParse(process.env);
const config: LoggerConfig = parsedLoggerConfig.success
  ? parsedLoggerConfig.data
  : {
      logLevel: "info",
    };

const logFormat = (
  msg: string,
  timestamp: string,
  level: string,
  {
    correlationId,
    eserviceId,
    eventType,
    eventVersion,
    organizationId,
    purposeId,
    serviceName,
    streamId,
    userId,
    version,
  }: LoggerMetadata,
) => {
  const serviceLogPart = serviceName ? `[${serviceName}]` : undefined;
  const userLogPart = userId ? `[UID=${userId}]` : undefined;
  const organizationLogPart = organizationId
    ? `[OID=${organizationId}]`
    : undefined;
  const correlationLogPart = correlationId
    ? `[CID=${correlationId}]`
    : undefined;
  const eventTypePart = eventType ? `[ET=${eventType}]` : undefined;
  const eventVersionPart = eventVersion ? `[EV=${eventVersion}]` : undefined;
  const streamIdPart = streamId ? `[SID=${streamId}]` : undefined;
  const versionIdPart = version != null ? `[VID=${version}]` : undefined; // avoid check for falsy, we need to log value 0
  const eserviceIdPart = eserviceId ? `[EID=${eserviceId}]` : undefined;
  const purposeIdPart = purposeId ? `[PRID=${purposeId}]` : undefined;

  const firstPart = [timestamp, level.toUpperCase(), serviceLogPart]
    .filter((e) => e !== undefined)
    .join(" ");

  const secondPart = [
    userLogPart,
    organizationLogPart,
    correlationLogPart,
    eventTypePart,
    eventVersionPart,
    streamIdPart,
    versionIdPart,
    eserviceIdPart,
    purposeIdPart,
  ]
    .filter((e) => e !== undefined)
    .join(" ");

  return `${firstPart} - ${secondPart} ${msg}`;
};

export const customFormat = () =>
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const clearMessage =
      typeof message === "object" ? JSON.stringify(message) : message;
    const lines = clearMessage
      .toString()
      .split("\n")
      .map((line: string) =>
        logFormat(line, timestamp, level, meta.loggerMetadata),
      );
    return lines.join("\n");
  });

const getLogger = () =>
  winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
      winston.format.errors({ stack: true }),
      customFormat(),
    ),
    level: config.logLevel,
    silent: process.env.NODE_ENV === "test",
    transports: [
      new winston.transports.Console({
        stderrLevels: ["error"],
      }),
    ],
  });

const internalLoggerInstance = getLogger();

export const logger = (loggerMetadata: LoggerMetadata) => ({
  debug: (msg: (typeof internalLoggerInstance.debug.arguments)[0]) =>
    internalLoggerInstance.debug(msg, { loggerMetadata }),
  error: (msg: (typeof internalLoggerInstance.error.arguments)[0]) =>
    internalLoggerInstance.error(msg, { loggerMetadata }),
  info: (msg: (typeof internalLoggerInstance.info.arguments)[0]) =>
    internalLoggerInstance.info(msg, { loggerMetadata }),
  isDebugEnabled: () => internalLoggerInstance.isDebugEnabled(),
  warn: (msg: (typeof internalLoggerInstance.warn.arguments)[0]) =>
    internalLoggerInstance.warn(msg, { loggerMetadata }),
});

export type Logger = ReturnType<typeof logger>;

export const genericLogger = logger({});

if (!parsedLoggerConfig.success) {
  // eslint-disable-next-line no-console
  console.log(
    `No LOG_LEVEL env var: defaulting log level to "${config.logLevel}"`,
  );
}
