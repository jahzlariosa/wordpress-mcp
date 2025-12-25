import { z } from "zod";

// Shared Zod schema fragments for tool inputs.
export const stringOrNumber = z.union([z.string(), z.number()]);
export const stringOrNumberArray = z.union([
  stringOrNumber,
  z.array(stringOrNumber),
]);
export const stringOrStringArray = z.union([z.string(), z.array(z.string())]);
export const stringOrRaw = z.union([z.string(), z.object({ raw: z.string() })]);
