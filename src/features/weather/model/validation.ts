import { z } from "zod";

const locationPattern = /^[\p{L}\p{N}][\p{L}\p{N}\s.'-]{0,78}[\p{L}\p{N}]$/u;

export const locationSchema = z
  .string()
  .trim()
  .min(1, "Location is required.")
  .max(80, "Location must be 80 characters or fewer.")
  .refine((value) => locationPattern.test(value), {
    message: "Enter a valid city or region name.",
  });

export const parseLocationInput = (value: string) =>
  locationSchema.safeParse(value);
