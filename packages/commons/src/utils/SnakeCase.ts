type SnakeCaseKey<T> = T extends `${infer A}${infer B}`
  ? `${A extends Capitalize<A> ? "_" : ""}${Lowercase<A>}${SnakeCaseKey<B>}`
  : T;

export type SnakeCase<T extends object> = {
  [key in keyof T as key extends string
    ? SnakeCaseKey<key>
    : key]: T[key] extends object ? SnakeCase<T[key]> : T[key];
};
