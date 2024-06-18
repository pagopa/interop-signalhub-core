type CamelizeKey<T> = T extends `${infer A}_${infer B}`
  ? `${A}${CamelizeKey<Capitalize<B>>}`
  : T;

export type Camelize<T extends object> = {
  [key in keyof T as key extends string
    ? CamelizeKey<key>
    : key]: T[key] extends object ? Camelize<T[key]> : T[key];
};
