import { z } from "zod";
import {
  MIN_LISTING_PHOTOS,
  MAX_LISTING_PHOTOS,
} from "@/lib/listing-constants";
import {
  CONDITION_VALUES,
  BOX_PAPERS_VALUES,
  SUPPORTED_CURRENCIES,
  GENDER_VALUES,
} from "./listing";

// ============================================
// Step 1: Photos Validation
// ============================================
export const stepPhotosSchema = z.object({
  photos: z
    .array(z.string().url("URL fotografije nije validan"))
    .min(MIN_LISTING_PHOTOS, `Dodajte najmanje ${MIN_LISTING_PHOTOS} fotografije`)
    .max(MAX_LISTING_PHOTOS, `Možete dodati najviše ${MAX_LISTING_PHOTOS} fotografija`),
});

export type StepPhotosData = z.infer<typeof stepPhotosSchema>;

// ============================================
// Step 2: Watch Identity Validation
// ============================================
const BRAND_MIN = 2;
const BRAND_MAX = 60;
const MODEL_MIN = 2;
const MODEL_MAX = 60;

export const stepIdentitySchema = z.object({
  brand: z
    .string()
    .trim()
    .min(1, "Marka je obavezna")
    .min(BRAND_MIN, `Marka mora imati najmanje ${BRAND_MIN} karaktera`)
    .max(BRAND_MAX, `Marka može imati najviše ${BRAND_MAX} karaktera`),
  model: z
    .string()
    .trim()
    .min(1, "Model je obavezan")
    .min(MODEL_MIN, `Model mora imati najmanje ${MODEL_MIN} karaktera`)
    .max(MODEL_MAX, `Model može imati najviše ${MODEL_MAX} karaktera`),
  reference: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value ||
        /^[A-Za-z0-9\-./]{2,30}$/.test(value.trim()),
      "Referenca može sadržati samo slova, brojeve i - . / (2-30 karaktera)"
    ),
  condition: z.enum(CONDITION_VALUES, "Odaberite stanje sata"),
  gender: z.enum(GENDER_VALUES, "Odaberite kome je sat namenjen"),
});

export type StepIdentityData = z.infer<typeof stepIdentitySchema>;

// ============================================
// Step 3: Pricing & Condition Details Validation
// ============================================
export const stepPricingSchema = z.object({
  currency: z.enum(SUPPORTED_CURRENCIES, "Odaberite valutu"),
  priceEurCents: z
    .string()
    .trim()
    .min(1, "Cena je obavezna")
    .regex(/^\d+(\.\d{1,2})?$/, "Cena mora biti validan broj")
    .refine((value) => Number.parseFloat(value) > 0, "Cena mora biti veća od 0"),
  boxPapers: z.enum(BOX_PAPERS_VALUES).optional(),
  warranty: z.enum(["Active Warranty", "Expired Warranty", "No Warranty"]).optional(),
  warrantyCard: z.boolean().optional(),
  originalOwner: z.boolean().optional(),
  runningCondition: z.enum([
    "Running Perfectly",
    "Minor Issues",
    "Needs Service",
    "Not Running"
  ]).optional(),
});

export type StepPricingData = z.infer<typeof stepPricingSchema>;

// ============================================
// Step 4: Optional Details Validation
// ============================================
const YEAR_MIN = 1900;
const YEAR_MAX = new Date().getFullYear() + 1;
const DIAMETER_MIN = 10;
const DIAMETER_MAX = 70;
const THICKNESS_MIN = 3;
const THICKNESS_MAX = 30;
const WATER_RESISTANCE_MIN = 0;
const WATER_RESISTANCE_MAX = 10000;
const STRAP_WIDTH_MIN = 10;
const STRAP_WIDTH_MAX = 30;
const CASE_TEXT_MAX = 80;
const MOVEMENT_TEXT_MAX = 80;
const CALIBER_MAX = 50;
const DESCRIPTION_MAX = 2000;
const LOCATION_MAX = 120;

export const stepDetailsSchema = z.object({
  // Year
  year: z
    .string()
    .optional()
    .refine((value) => {
      if (!value || !value.trim()) return true;
      if (!/^\d{4}$/.test(value.trim())) return false;
      const parsed = Number(value.trim());
      return parsed >= YEAR_MIN && parsed <= YEAR_MAX;
    }, `Godina mora biti između ${YEAR_MIN} i ${YEAR_MAX}`),

  // Case & Movement
  caseDiameterMm: z
    .string()
    .optional()
    .refine((value) => {
      if (!value || !value.trim()) return true;
      if (!/^\d{1,3}$/.test(value.trim())) return false;
      const parsed = Number(value.trim());
      return parsed >= DIAMETER_MIN && parsed <= DIAMETER_MAX;
    }, `Prečnik mora biti broj između ${DIAMETER_MIN} i ${DIAMETER_MAX} mm`),

  caseThicknessMm: z
    .string()
    .optional()
    .refine((value) => {
      if (!value || !value.trim()) return true;
      if (!/^\d{1,2}(\.\d{1})?$/.test(value.trim())) return false;
      const parsed = Number.parseFloat(value.trim());
      return parsed >= THICKNESS_MIN && parsed <= THICKNESS_MAX;
    }, `Debljina kućišta mora biti broj između ${THICKNESS_MIN} i ${THICKNESS_MAX} mm`),

  caseMaterial: z
    .string()
    .optional()
    .refine(
      (value) => !value || value.trim().length <= CASE_TEXT_MAX,
      `Materijal kućišta može imati najviše ${CASE_TEXT_MAX} karaktera`
    ),

  waterResistanceM: z
    .string()
    .optional()
    .refine((value) => {
      if (!value || !value.trim()) return true;
      if (!/^\d+$/.test(value.trim())) return false;
      const parsed = Number.parseInt(value.trim(), 10);
      return parsed >= WATER_RESISTANCE_MIN && parsed <= WATER_RESISTANCE_MAX;
    }, `Vodootpornost mora biti broj između ${WATER_RESISTANCE_MIN} i ${WATER_RESISTANCE_MAX} metara`),

  movement: z
    .string()
    .optional()
    .refine(
      (value) => !value || value.trim().length <= MOVEMENT_TEXT_MAX,
      `Mehanizam može imati najviše ${MOVEMENT_TEXT_MAX} karaktera`
    ),

  movementType: z.enum([
    "Automatic",
    "Manual",
    "Quartz",
    "Spring Drive",
    "Tourbillon",
    "Other"
  ]).optional(),

  caliber: z
    .string()
    .optional()
    .refine(
      (value) => !value || value.trim().length <= CALIBER_MAX,
      `Kalibar može imati najviše ${CALIBER_MAX} karaktera`
    ),

  // Dial & Bezel
  dialColor: z.enum([
    "Black",
    "White",
    "Blue",
    "Silver",
    "Champagne",
    "Green",
    "Brown",
    "Gray",
    "Other"
  ]).optional(),

  dateDisplay: z.enum([
    "No Date",
    "Date",
    "Day-Date",
    "GMT",
    "Other"
  ]).optional(),

  bezelType: z.enum([
    "Fixed",
    "Rotating",
    "GMT",
    "Tachymeter",
    "Countdown",
    "Other"
  ]).optional(),

  bezelMaterial: z
    .string()
    .optional()
    .refine(
      (value) => !value || value.trim().length <= CASE_TEXT_MAX,
      `Materijal bezela može imati najviše ${CASE_TEXT_MAX} karaktera`
    ),

  // Strap/Bracelet
  strapType: z.enum([
    "Metal Bracelet",
    "Leather",
    "Rubber",
    "NATO",
    "Fabric",
    "Other"
  ]).optional(),

  braceletMaterial: z
    .string()
    .optional()
    .refine(
      (value) => !value || value.trim().length <= CASE_TEXT_MAX,
      `Materijal narukvice može imati najviše ${CASE_TEXT_MAX} karaktera`
    ),

  strapWidthMm: z
    .string()
    .optional()
    .refine((value) => {
      if (!value || !value.trim()) return true;
      if (!/^\d{1,2}(\.\d{1})?$/.test(value.trim())) return false;
      const parsed = Number.parseFloat(value.trim());
      return parsed >= STRAP_WIDTH_MIN && parsed <= STRAP_WIDTH_MAX;
    }, `Širina narukvice mora biti broj između ${STRAP_WIDTH_MIN} i ${STRAP_WIDTH_MAX} mm`),

  // Additional Info
  description: z
    .string()
    .optional()
    .refine(
      (value) => !value || value.trim().length <= DESCRIPTION_MAX,
      `Opis može imati najviše ${DESCRIPTION_MAX} karaktera`
    ),

  location: z
    .string()
    .optional()
    .refine(
      (value) => !value || value.trim().length <= LOCATION_MAX,
      `Lokacija može imati najviše ${LOCATION_MAX} karaktera`
    ),
});

export type StepDetailsData = z.infer<typeof stepDetailsSchema>;

// ============================================
// Combined Full Form Schema (for final submission)
// ============================================
export const listingWizardFullSchema = stepIdentitySchema
  .merge(stepPricingSchema)
  .merge(stepDetailsSchema)
  .extend({
    photos: stepPhotosSchema.shape.photos,
  });

export type ListingWizardFullData = z.infer<typeof listingWizardFullSchema>;

// ============================================
// Step field definitions for validation triggers
// ============================================
export const WIZARD_STEP_FIELDS = {
  0: ["photos"] as const,
  1: ["brand", "model", "reference", "condition", "gender"] as const,
  2: ["currency", "priceEurCents", "boxPapers", "warranty", "warrantyCard", "originalOwner", "runningCondition"] as const,
  3: [
    "year", "caseDiameterMm", "caseThicknessMm", "caseMaterial", "waterResistanceM",
    "movement", "movementType", "caliber", "dialColor", "dateDisplay",
    "bezelType", "bezelMaterial", "strapType", "braceletMaterial", "strapWidthMm",
    "description", "location"
  ] as const,
} as const;
