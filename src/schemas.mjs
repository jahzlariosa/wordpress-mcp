import { z } from "zod";

export const stringOrNumber = z.union([z.string(), z.number()]);
export const stringOrStringArray = z.union([z.string(), z.array(z.string())]);
export const stringOrRaw = z.union([z.string(), z.object({ raw: z.string() })]);
