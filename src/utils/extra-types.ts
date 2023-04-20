type GetConstraint<T, K> = {
  [key in Exclude<keyof T | keyof K, keyof T>]?: never;
};

type GetConstraints<T extends any[], K> = T extends [infer A, ...infer B]
  ? (A & GetConstraint<A, K>) | GetConstraints<B, K>
  : never;

type Merge<A, B> = {
  [K in keyof A | keyof B]: K extends keyof A
    ? K extends keyof B
      ? A[K] | B[K]
      : A[K]
    : K extends keyof B
    ? B[K]
    : never;
};

type MergeAll<T extends any[]> = T extends [infer A, ...infer B]
  ? A extends object
    ? B extends any[]
      ? Merge<A, MergeAll<B>>
      : never
    : never
  : {};


export type OneOf<T extends any[]> = GetConstraints<T, MergeAll<T>>;
