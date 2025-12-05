import { z } from "zod";
import {
  MIN_LISTING_PHOTOS,
  MAX_LISTING_PHOTOS,
} from "@/lib/listing-constants";

export const CONDITION_VALUES = [
  "New",
  "Like New",
  "Excellent",
  "Very Good",
  "Good",
  "Fair",
] as const;

export const BOX_PAPERS_VALUES = [
  "Full Set",
  "Box Only",
  "Papers Only",
  "No Box or Papers",
] as const;

export const SUPPORTED_CURRENCIES = ["EUR", "RSD"] as const;

export const GENDER_VALUES = ["MALE", "FEMALE", "UNISEX"] as const;

const TITLE_MIN = 5;
const TITLE_MAX = 120;
const BRAND_MIN = 2;
const BRAND_MAX = 60;
const MODEL_MIN = 2;
const MODEL_MAX = 60;
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

// Title is now optional/computed from brand+model, but kept for backward compatibility
const titleSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (value) => !value || (value.length >= TITLE_MIN && value.length <= TITLE_MAX),
    `Naziv mora imati između ${TITLE_MIN} i ${TITLE_MAX} karaktera`
  );

const brandSchema = z
  .string()
  .trim()
  .min(1, "Marka je obavezna")
  .min(BRAND_MIN, `Marka mora imati najmanje ${BRAND_MIN} karaktera`)
  .max(BRAND_MAX, `Marka može imati najviše ${BRAND_MAX} karaktera`);

const modelSchema = z
  .string()
  .trim()
  .min(1, "Model je obavezan")
  .min(MODEL_MIN, `Model mora imati najmanje ${MODEL_MIN} karaktera`)
  .max(MODEL_MAX, `Model može imati najviše ${MODEL_MAX} karaktera`);

const referenceSchema = z
  .string()
  .optional()
  .refine(
    (value) =>
      !value ||
      /^[A-Za-z0-9\-./]{2,30}$/.test(value.trim()),
    "Referenca može sadržati samo slova, brojeve i - . / (2-30 karaktera)"
  );

const descriptionSchema = z
  .string()
  .optional()
  .refine(
    (value) =>
      !value || value.trim().length <= DESCRIPTION_MAX,
    `Opis može imati najviše ${DESCRIPTION_MAX} karaktera`
  );

const locationSchema = z
  .string()
  .optional()
  .refine(
    (value) =>
      !value || value.trim().length <= LOCATION_MAX,
    `Lokacija može imati najviše ${LOCATION_MAX} karaktera`
  );

const caseMaterialSchema = z
  .string()
  .optional()
  .refine(
    (value) =>
      !value || value.trim().length <= CASE_TEXT_MAX,
    `Materijal kućišta može imati najviše ${CASE_TEXT_MAX} karaktera`
  );

const movementSchema = z
  .string()
  .optional()
  .refine(
    (value) =>
      !value || value.trim().length <= MOVEMENT_TEXT_MAX,
    `Mehanizam može imati najviše ${MOVEMENT_TEXT_MAX} karaktera`
  );

const movementTypeSchema = z.enum([
  "Automatic",
  "Manual",
  "Quartz",
  "Spring Drive",
  "Tourbillon",
  "Other"
]).optional();

const caliberSchema = z
  .string()
  .optional()
  .refine(
    (value) => !value || value.trim().length <= CALIBER_MAX,
    `Kalibar može imati najviše ${CALIBER_MAX} karaktera`
  );

const caseThicknessStringSchema = z
  .string()
  .optional()
  .refine((value) => {
    if (!value || !value.trim()) return true;
    if (!/^\d{1,2}(\.\d{1})?$/.test(value.trim())) return false;
    const parsed = Number.parseFloat(value.trim());
    return parsed >= THICKNESS_MIN && parsed <= THICKNESS_MAX;
  }, `Debljina kućišta mora biti broj između ${THICKNESS_MIN} i ${THICKNESS_MAX} mm`);

const waterResistanceStringSchema = z
  .string()
  .optional()
  .refine((value) => {
    if (!value || !value.trim()) return true;
    if (!/^\d+$/.test(value.trim())) return false;
    const parsed = Number.parseInt(value.trim(), 10);
    return parsed >= WATER_RESISTANCE_MIN && parsed <= WATER_RESISTANCE_MAX;
  }, `Vodootpornost mora biti broj između ${WATER_RESISTANCE_MIN} i ${WATER_RESISTANCE_MAX} metara`);

const dialColorSchema = z.enum([
  "Black",
  "White",
  "Blue",
  "Silver",
  "Champagne",
  "Green",
  "Brown",
  "Gray",
  "Other"
]).optional();

const dateDisplaySchema = z.enum([
  "No Date",
  "Date",
  "Day-Date",
  "GMT",
  "Other"
]).optional();

const bezelTypeSchema = z.enum([
  "Fixed",
  "Rotating",
  "GMT",
  "Tachymeter",
  "Countdown",
  "Other"
]).optional();

const bezelMaterialSchema = z
  .string()
  .optional()
  .refine(
    (value) => !value || value.trim().length <= CASE_TEXT_MAX,
    `Materijal bezela može imati najviše ${CASE_TEXT_MAX} karaktera`
  );

const strapTypeSchema = z.enum([
  "Metal Bracelet",
  "Leather",
  "Rubber",
  "NATO",
  "Fabric",
  "Other"
]).optional();

const braceletMaterialSchema = z
  .string()
  .optional()
  .refine(
    (value) => !value || value.trim().length <= CASE_TEXT_MAX,
    `Materijal narukvice može imati najviše ${CASE_TEXT_MAX} karaktera`
  );

const strapWidthStringSchema = z
  .string()
  .optional()
  .refine((value) => {
    if (!value || !value.trim()) return true;
    if (!/^\d{1,2}(\.\d{1})?$/.test(value.trim())) return false;
    const parsed = Number.parseFloat(value.trim());
    return parsed >= STRAP_WIDTH_MIN && parsed <= STRAP_WIDTH_MAX;
  }, `Širina narukvice mora biti broj između ${STRAP_WIDTH_MIN} i ${STRAP_WIDTH_MAX} mm`);

const warrantySchema = z.enum([
  "Active Warranty",
  "Expired Warranty",
  "No Warranty"
]).optional();

const warrantyCardSchema = z.boolean().optional();

const originalOwnerSchema = z.boolean().optional();

const runningConditionSchema = z.enum([
  "Running Perfectly",
  "Minor Issues",
  "Needs Service",
  "Not Running"
]).optional();

const yearStringSchema = z
  .string()
  .optional()
  .refine((value) => {
    if (!value || !value.trim()) return true;
    if (!/^\d{4}$/.test(value.trim())) return false;
    const parsed = Number(value.trim());
    return parsed >= YEAR_MIN && parsed <= YEAR_MAX;
  }, `Godina mora biti između ${YEAR_MIN} i ${YEAR_MAX}`);

const caseDiameterStringSchema = z
  .string()
  .optional()
  .refine((value) => {
    if (!value || !value.trim()) return true;
    if (!/^\d{1,3}$/.test(value.trim())) return false;
    const parsed = Number(value.trim());
    return parsed >= DIAMETER_MIN && parsed <= DIAMETER_MAX;
  }, `Prečnik mora biti broj između ${DIAMETER_MIN} i ${DIAMETER_MAX} mm`);

const priceStringSchema = z
  .string()
  .trim()
  .min(1, "Cena je obavezna")
  .regex(/^\d+(\.\d{1,2})?$/, "Cena mora biti validan broj")
  .refine((value) => Number.parseFloat(value) > 0, "Cena mora biti veća od 0");

export const listingFormSchema = z.object({
  title: titleSchema,
  brand: brandSchema,
  model: modelSchema,
  reference: referenceSchema,
  year: yearStringSchema,
  caseDiameterMm: caseDiameterStringSchema,
  caseThicknessMm: caseThicknessStringSchema,
  caseMaterial: caseMaterialSchema,
  waterResistanceM: waterResistanceStringSchema,
  movement: movementSchema,
  movementType: movementTypeSchema,
  caliber: caliberSchema,
  dialColor: dialColorSchema,
  dateDisplay: dateDisplaySchema,
  bezelType: bezelTypeSchema,
  bezelMaterial: bezelMaterialSchema,
  strapType: strapTypeSchema,
  braceletMaterial: braceletMaterialSchema,
  strapWidthMm: strapWidthStringSchema,
  warranty: warrantySchema,
  warrantyCard: warrantyCardSchema,
  originalOwner: originalOwnerSchema,
  runningCondition: runningConditionSchema,
  condition: z.enum(CONDITION_VALUES),
  gender: z.enum(GENDER_VALUES),
  priceEurCents: priceStringSchema,
  currency: z.enum(SUPPORTED_CURRENCIES),
  boxPapers: z.enum(BOX_PAPERS_VALUES).optional(),
  description: descriptionSchema,
  location: locationSchema,
});

export type ListingFormSchema = z.infer<typeof listingFormSchema>;

const yearNumberSchema = z
  .number()
  .int()
  .min(YEAR_MIN, `Godina mora biti između ${YEAR_MIN} i ${YEAR_MAX}`)
  .max(YEAR_MAX, `Godina mora biti između ${YEAR_MIN} i ${YEAR_MAX}`)
  .nullable()
  .optional();

const caseDiameterNumberSchema = z
  .number()
  .int()
  .min(DIAMETER_MIN, `Prečnik kućišta mora biti najmanje ${DIAMETER_MIN} mm`)
  .max(DIAMETER_MAX, `Prečnik kućišta može biti najviše ${DIAMETER_MAX} mm`)
  .nullable()
  .optional();

const caseThicknessNumberSchema = z
  .number()
  .refine(
    (value) => !value || (value >= THICKNESS_MIN && value <= THICKNESS_MAX),
    `Debljina kućišta mora biti između ${THICKNESS_MIN} i ${THICKNESS_MAX} mm`
  )
  .nullable()
  .optional();

const waterResistanceNumberSchema = z
  .number()
  .int()
  .min(WATER_RESISTANCE_MIN, `Vodootpornost mora biti najmanje ${WATER_RESISTANCE_MIN} m`)
  .max(WATER_RESISTANCE_MAX, `Vodootpornost može biti najviše ${WATER_RESISTANCE_MAX} m`)
  .nullable()
  .optional();

const strapWidthNumberSchema = z
  .number()
  .refine(
    (value) => !value || (value >= STRAP_WIDTH_MIN && value <= STRAP_WIDTH_MAX),
    `Širina narukvice mora biti između ${STRAP_WIDTH_MIN} i ${STRAP_WIDTH_MAX} mm`
  )
  .nullable()
  .optional();

const descriptionServerSchema = z
  .string()
  .trim()
  .max(DESCRIPTION_MAX, `Opis može imati najviše ${DESCRIPTION_MAX} karaktera`)
  .optional();

const locationServerSchema = z
  .string()
  .trim()
  .max(LOCATION_MAX, `Lokacija može imati najviše ${LOCATION_MAX} karaktera`)
  .optional();

const caseMaterialServerSchema = z
  .string()
  .trim()
  .max(CASE_TEXT_MAX, `Materijal kućišta može imati najviše ${CASE_TEXT_MAX} karaktera`)
  .optional();

const movementServerSchema = z
  .string()
  .trim()
  .max(MOVEMENT_TEXT_MAX, `Mehanizam može imati najviše ${MOVEMENT_TEXT_MAX} karaktera`)
  .optional();

export const listingPhotosSchema = z
  .array(z.string().url("URL fotografije nije validan"))
  .min(MIN_LISTING_PHOTOS, `Oglas mora imati najmanje ${MIN_LISTING_PHOTOS} fotografije`)
  .max(MAX_LISTING_PHOTOS, `Oglas može imati najviše ${MAX_LISTING_PHOTOS} fotografija`);

export const listingCreateSchema = z.object({
  title: z.string().trim().optional(),
  brand: brandSchema,
  model: modelSchema,
  reference: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) =>
        !value ||
        /^[A-Za-z0-9\-./]{2,30}$/.test(value),
      "Referenca može sadržati samo slova, brojeve i - . / (2-30 karaktera)"
    ),
  year: yearNumberSchema,
  caseDiameterMm: caseDiameterNumberSchema,
  caseThicknessMm: caseThicknessNumberSchema,
  caseMaterial: caseMaterialServerSchema,
  waterResistanceM: waterResistanceNumberSchema,
  movement: movementServerSchema,
  movementType: z.enum(["Automatic", "Manual", "Quartz", "Spring Drive", "Tourbillon", "Other"]).optional().nullable(),
  caliber: z.string().trim().max(CALIBER_MAX).optional().nullable(),
  dialColor: z.enum(["Black", "White", "Blue", "Silver", "Champagne", "Green", "Brown", "Gray", "Other"]).optional().nullable(),
  dateDisplay: z.enum(["No Date", "Date", "Day-Date", "GMT", "Other"]).optional().nullable(),
  bezelType: z.enum(["Fixed", "Rotating", "GMT", "Tachymeter", "Countdown", "Other"]).optional().nullable(),
  bezelMaterial: z.string().trim().max(CASE_TEXT_MAX).optional().nullable(),
  strapType: z.enum(["Metal Bracelet", "Leather", "Rubber", "NATO", "Fabric", "Other"]).optional().nullable(),
  braceletMaterial: z.string().trim().max(CASE_TEXT_MAX).optional().nullable(),
  strapWidthMm: strapWidthNumberSchema,
  warranty: z.enum(["Active Warranty", "Expired Warranty", "No Warranty"]).optional().nullable(),
  warrantyCard: z.boolean().optional().nullable(),
  originalOwner: z.boolean().optional().nullable(),
  runningCondition: z.enum(["Running Perfectly", "Minor Issues", "Needs Service", "Not Running"]).optional().nullable(),
  condition: z.enum(CONDITION_VALUES),
  gender: z.enum(GENDER_VALUES),
  priceEurCents: z
    .number()
    .int()
    .positive("Cena mora biti pozitivan broj"),
  currency: z.enum(SUPPORTED_CURRENCIES),
  boxPapers: z.enum(BOX_PAPERS_VALUES).optional(),
  description: descriptionServerSchema,
  location: locationServerSchema,
  photos: listingPhotosSchema,
});

export const listingUpdateSchema = listingCreateSchema
  .partial()
  .extend({
    photos: listingPhotosSchema.optional(),
  });

