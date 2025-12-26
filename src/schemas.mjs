import { z } from "zod";

// Shared Zod schema fragments for tool inputs.
export const stringOrNumber = z.union([z.string(), z.number()]);
export const stringOrNumberArray = z.union([
  stringOrNumber,
  z.array(stringOrNumber),
]);
export const stringOrStringArray = z.union([z.string(), z.array(z.string())]);
export const stringOrRaw = z.union([z.string(), z.object({ raw: z.string() })]);
export const yoastMeta = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  focuskw: z.string().optional(),
  focuskw_synonyms: z.string().optional(),
  focuskeywords: z.string().optional(),
  keywordsynonyms: z.string().optional(),
  canonical: z.string().optional(),
  noindex: z.boolean().optional(),
  nofollow: z.boolean().optional(),
  og_title: z.string().optional(),
  og_description: z.string().optional(),
  twitter_title: z.string().optional(),
  twitter_description: z.string().optional(),
});
