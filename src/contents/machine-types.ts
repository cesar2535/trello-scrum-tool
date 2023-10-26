import { Schema } from "@effect/schema";
import type { MachineParams } from "./types";

/** State machine `context` */
export const Context = Schema.struct({
  isLegacy: Schema.boolean,
  index: Schema.union(Schema.number, Schema.null),
  members: Schema.array(
    Schema.struct({ id: Schema.string, name: Schema.string })
  ),
  columnLabel: Schema.string
});
export interface Context extends Schema.Schema.To<typeof Context> {}

export type Input = {
  readonly isLegacy?: boolean;
  readonly columnLabel: string;
};
export type Events = MachineParams<{
  done: { isLegacy: boolean };
  next: {};
}>;
export type Guards = MachineParams<{ isLast: {}; noMembers: {} }>;
