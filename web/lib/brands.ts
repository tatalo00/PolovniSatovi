export const POPULAR_BRANDS = [
  { name: "Rolex", description: "Ikonični švajcarski satovi", verified: true },
  { name: "Omega", description: "Zvanični izbor NASA-e", verified: true },
  { name: "Tudor", description: "Robustan alatni sat" },
  { name: "Seiko", description: "Japanska preciznost" },
  { name: "Zenith", description: "High-beat horologija" },
  { name: "Patek Philippe", description: "Haute horlogerie", verified: true },
  { name: "Audemars Piguet", description: "Royal Oak majstorstvo", verified: true },
  { name: "Breitling", description: "Pilot satovi" },
  { name: "TAG Heuer", description: "Racing nasleđe" },
  { name: "Cartier", description: "Elegancija i stil", verified: true },
  { name: "Grand Seiko", description: "Spring Drive inovacija" },
  { name: "IWC", description: "Inženjerska preciznost", verified: true },
  { name: "Longines", description: "Pristupačni švajcarski klasici" },
  { name: "Panerai", description: "Italijanski dizajn i švajcarska izrada" },
  { name: "Hublot", description: "Inovativni materijali i dizajn" },
  { name: "Hamilton", description: "Američko nasleđe, švajcarska preciznost" },
] as const;

export const POPULAR_BRAND_NAMES = POPULAR_BRANDS.map((brand) => brand.name);

export const POPULAR_BRANDS_LOOKUP = new Map(
  POPULAR_BRANDS.map((brand) => [brand.name.toLowerCase(), brand])
);
