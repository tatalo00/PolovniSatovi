export const POPULAR_BRANDS = [
  { name: "Rolex", description: "Ikonični švajcarski satovi" },
  { name: "Omega", description: "Zvanični izbor NASA-e" },
  { name: "Tudor", description: "Robustan alatni sat" },
  { name: "Seiko", description: "Japanska preciznost" },
  { name: "Zenith", description: "High-beat horologija" },
  { name: "Patek Philippe", description: "Haute horlogerie" },
  { name: "Audemars Piguet", description: "Royal Oak majstorstvo" },
  { name: "Breitling", description: "Pilot satovi" },
  { name: "TAG Heuer", description: "Racing nasleđe" },
  { name: "Cartier", description: "Elegancija i stil" },
  { name: "Grand Seiko", description: "Spring Drive inovacija" },
  { name: "IWC", description: "Inženjerska preciznost" },
] as const;

export const POPULAR_BRAND_NAMES = POPULAR_BRANDS.map((brand) => brand.name);


