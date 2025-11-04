import { z, ZodIssue } from "zod";

// Common validation schemas
export const emailSchema = z.string().email("Neispravan email format");

export const passwordSchema = z
  .string()
  .min(8, "Šifra mora imati najmanje 8 karaktera")
  .regex(/[A-Z]/, "Šifra mora sadržati najmanje jedno veliko slovo")
  .regex(/[a-z]/, "Šifra mora sadržati najmanje jedno malo slovo")
  .regex(/[0-9]/, "Šifra mora sadržati najmanje jedan broj");

export const nameSchema = z
  .string()
  .min(2, "Ime mora imati najmanje 2 karaktera")
  .max(100, "Ime ne može biti duže od 100 karaktera")
  .regex(/^[a-zA-Z\sčćžšđČĆŽŠĐ]+$/, "Ime može sadržati samo slova i razmake");

export const phoneSchema = z
  .string()
  .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, "Neispravan format telefona");

export const urlSchema = z.string().url("Neispravan URL format");

// Sanitize string input
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

// Validate and sanitize
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((e: any) => e.message).join(", "),
      };
    }
    return { success: false, error: "Validation error" };
  }
}

