import { z } from "zod";
export const SuccessfulHttpStatusCode = z.union([
  z.literal(200),
  z.literal(201),
  z.literal(202),
  z.literal(203),
  z.literal(204),
  z.literal(205),
  z.literal(206),
  z.literal(207)
]);

export type SuccessfulHttpStatusCode = z.infer<typeof SuccessfulHttpStatusCode>;

export const ErrorHttpStatusCode = z.union([
  z.literal(100),
  z.literal(101),
  z.literal(102),
  z.literal(300),
  z.literal(301),
  z.literal(302),
  z.literal(303),
  z.literal(304),
  z.literal(305),
  z.literal(307),
  z.literal(308),
  z.literal(400),
  z.literal(401),
  z.literal(402),
  z.literal(403),
  z.literal(404),
  z.literal(405),
  z.literal(406),
  z.literal(407),
  z.literal(408),
  z.literal(409),
  z.literal(410),
  z.literal(411),
  z.literal(412),
  z.literal(413),
  z.literal(414),
  z.literal(415),
  z.literal(416),
  z.literal(417),
  z.literal(418),
  z.literal(419),
  z.literal(420),
  z.literal(421),
  z.literal(422),
  z.literal(423),
  z.literal(424),
  z.literal(428),
  z.literal(429),
  z.literal(431),
  z.literal(451),
  z.literal(500),
  z.literal(501),
  z.literal(502),
  z.literal(503),
  z.literal(504),
  z.literal(505),
  z.literal(507),
  z.literal(511)
]);

export type ErrorHttpStatusCode = z.infer<typeof ErrorHttpStatusCode>;

const HTTPStatusCode = SuccessfulHttpStatusCode.or(ErrorHttpStatusCode);
export type HTTPStatusCode = z.infer<typeof HTTPStatusCode>;
