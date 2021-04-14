export type Optional<T> = undefined | T;
export type Address = string;
export type TransactionHash = string;
export type TokenId = string;
export type URI = string;

export enum TransactionStateEnum {
  FAILED,
  SUCCESS,
  PENDING,
}

export type Path = string[];
