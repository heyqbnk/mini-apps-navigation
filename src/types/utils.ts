/**
 * Flow's Maybe alternative
 */
export type Maybe<T> = T | null | undefined;

/**
 * Make some part of object partial
 */
export type MakePartial<T extends object, K extends keyof T> =
  Omit<T, K>
  & { [P in K]?: Maybe<T[P]> };
