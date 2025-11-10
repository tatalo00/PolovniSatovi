export interface ListingSummary {
  id: string;
  title: string;
  brand: string;
  model: string;
  reference: string | null;
  year: number | null;
  condition: string | null;
  gender?: "MALE" | "FEMALE" | "UNISEX";
  priceEurCents: number;
  location: string | null;
  boxPapers?: string | null;
  photos: { url: string }[];
  seller?: {
    name: string | null;
    email: string;
    locationCity: string | null;
    locationCountry: string | null;
  } | null;
  status?: string;
  favoritedAt?: Date;
}

