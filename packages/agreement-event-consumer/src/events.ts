/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { KafkaMessage } from "kafkajs";
import { z } from "zod";

export const EventEnvelope = <TEventZodType extends z.ZodType>(
  event: TEventZodType
) =>
  z.intersection(
    z.object({
      sequence_num: z.number(),
      stream_id: z.string().uuid(),
      version: z.number(),
      correlation_id: z.string().nullish(),
      log_date: z.coerce.date(),
    }),
    event
  );
export type EventEnvelope<TEvent> = z.infer<
  ReturnType<typeof EventEnvelope<z.ZodType<TEvent>>>
>;

export const DebeziumCreatePayload = <TEventZodType extends z.ZodType>(
  event: TEventZodType
) =>
  z.object({
    op: z.enum(["c", "r"]),
    after: EventEnvelope(event),
  });
export type DebeziumCreatePayload<TEvent> = z.infer<
  ReturnType<typeof DebeziumCreatePayload<z.ZodType<TEvent>>>
>;

export const Message = <TEventZodType extends z.ZodType>(
  event: TEventZodType
) =>
  z.object({
    value: z.preprocess(
      (v) => (v != null ? JSON.parse(v.toString()) : null),
      DebeziumCreatePayload(EventEnvelope(event))
    ),
  });
export type Message<TEvent> = z.infer<
  ReturnType<typeof Message<z.ZodType<TEvent>>>
>;

export function decodeKafkaMessage<TEvent extends z.ZodType>(
  message: KafkaMessage,
  event: TEvent
) {
  console.log("messaggio", message);
  const parsed = Message(event).safeParse(message);

  if (!parsed.success) {
    throw new Error("Invalid message: " + JSON.stringify(parsed.error));
  } else if (!parsed.data.value?.after) {
    throw new Error(
      "Invalid message: missing value " + JSON.stringify(parsed.data)
    );
  }
  return parsed.data.value.after;
}
