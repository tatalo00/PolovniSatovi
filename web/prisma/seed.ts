import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local explicitly and override any existing env vars
// This ensures .env.local takes precedence over system environment variables
config({ path: resolve(process.cwd(), ".env.local"), override: true });
config({ path: resolve(process.cwd(), ".env") });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const sellerEmail = "mvp-seller@example.com";

  const seller = await prisma.user.upsert({
    where: { email: sellerEmail },
    update: {
      name: "MVP Demo Seller",
      role: "SELLER",
      locationCountry: "RS",
      locationCity: "Beograd",
      sellerProfile: {
        upsert: {
          update: {
            storeName: "MVP Watch Boutique",
            description: "Curated selection of premium pre-owned watches for testing.",
            locationCountry: "RS",
            locationCity: "Beograd",
          },
          create: {
            storeName: "MVP Watch Boutique",
            description: "Curated selection of premium pre-owned watches for testing.",
            locationCountry: "RS",
            locationCity: "Beograd",
          },
        },
      },
    },
    create: {
      email: sellerEmail,
      name: "MVP Demo Seller",
      role: "SELLER",
      locationCountry: "RS",
      locationCity: "Beograd",
      sellerProfile: {
        create: {
          storeName: "MVP Watch Boutique",
          description: "Curated selection of premium pre-owned watches for testing.",
          locationCountry: "RS",
          locationCity: "Beograd",
        },
      },
    },
  });

  const listingsSeed = [
    {
      title: "Rolex Submariner Date Ceramic",
      brand: "Rolex",
      model: "Submariner",
      reference: "126610LN",
      year: 2022,
      condition: "Excellent",
      priceEurCents: 1225000,
      location: "Beograd, Srbija",
      description: "Box & papers, worn a handful of times.",
    },
    {
      title: "Omega Speedmaster Professional Moonwatch",
      brand: "Omega",
      model: "Speedmaster",
      reference: "310.30.42.50.01.001",
      year: 2021,
      condition: "Very Good",
      priceEurCents: 585000,
      location: "Novi Sad, Srbija",
      description: "Manual wind, sapphire sandwich with original accessories.",
    },
    {
      title: "Tudor Black Bay Fifty-Eight Navy Blue",
      brand: "Tudor",
      model: "Black Bay 58",
      reference: "79030B",
      year: 2020,
      condition: "Excellent",
      priceEurCents: 348000,
      location: "Beograd, Srbija",
      description: "Full set, still under Tudor warranty.",
    },
    {
      title: "Breitling Navitimer 01 Chronograph",
      brand: "Breitling",
      model: "Navitimer 01",
      reference: "AB012012",
      year: 2016,
      condition: "Very Good",
      priceEurCents: 497500,
      location: "Sarajevo, BiH",
      description: "Iconic pilot chronograph, freshly serviced.",
    },
    {
      title: "TAG Heuer Monaco Calibre 11 Gulf Special",
      brand: "TAG Heuer",
      model: "Monaco",
      reference: "CAW211R",
      year: 2019,
      condition: "Excellent",
      priceEurCents: 559000,
      location: "Zagreb, Hrvatska",
      description: "Limited edition Gulf racing stripes, complete set.",
    },
    {
      title: "Grand Seiko Snowflake Spring Drive",
      brand: "Grand Seiko",
      model: "SBGA211",
      reference: "SBGA211",
      year: 2018,
      condition: "Very Good",
      priceEurCents: 482000,
      location: "Beograd, Srbija",
      description: "Snowflake dial, spring drive accuracy, titanium case.",
    },
    {
      title: "Audemars Piguet Royal Oak Offshore Diver",
      brand: "Audemars Piguet",
      model: "Royal Oak Offshore",
      reference: "15710ST",
      year: 2017,
      condition: "Excellent",
      priceEurCents: 1950000,
      location: "Podgorica, Crna Gora",
      description: "Blue dial diver in stellar condition, includes service papers.",
    },
    {
      title: "Panerai Luminor Marina 1950 3 Days",
      brand: "Panerai",
      model: "Luminor Marina",
      reference: "PAM01312",
      year: 2019,
      condition: "Excellent",
      priceEurCents: 625000,
      location: "Beograd, Srbija",
      description: "8-day power reserve, sandwich dial, spare strap included.",
    },
    {
      title: "Cartier Santos de Cartier Large",
      brand: "Cartier",
      model: "Santos",
      reference: "WSSA0018",
      year: 2022,
      condition: "Like New",
      priceEurCents: 695000,
      location: "Budva, Crna Gora",
      description: "QuickSwitch strap system with both bracelet and leather.",
    },
    {
      title: "IWC Portugieser Chronograph Classic",
      brand: "IWC",
      model: "Portugieser",
      reference: "IW390403",
      year: 2015,
      condition: "Very Good",
      priceEurCents: 735000,
      location: "Ljubljana, Slovenija",
      description: "Elegant chronograph in rose gold, lightly worn.",
    },
    {
      title: "Seiko Prospex LX SNR033J1",
      brand: "Seiko",
      model: "Prospex LX",
      reference: "SNR033",
      year: 2020,
      condition: "Excellent",
      priceEurCents: 365000,
      location: "Niš, Srbija",
      description: "Spring Drive GMT diver with Zaratsu polishing.",
    },
    {
      title: "Hublot Big Bang Unico Titanium",
      brand: "Hublot",
      model: "Big Bang",
      reference: "411.NX.1170.RX",
      year: 2018,
      condition: "Very Good",
      priceEurCents: 1295000,
      location: "Beograd, Srbija",
      description: "Skeleton dial with Unico in-house chronograph movement.",
    },
    {
      title: "Longines Spirit Zulu Time GMT",
      brand: "Longines",
      model: "Spirit Zulu Time",
      reference: "L3.812.4.63.6",
      year: 2023,
      condition: "Like New",
      priceEurCents: 245000,
      location: "Zadar, Hrvatska",
      description: "COSC certified GMT with quick-adjust bracelet.",
    },
    {
      title: "Zenith Chronomaster Sport Black Ceramic",
      brand: "Zenith",
      model: "Chronomaster Sport",
      reference: "03.3100.3600/21.M3100",
      year: 2021,
      condition: "Excellent",
      priceEurCents: 915000,
      location: "Banja Luka, BiH",
      description: "El Primero high-beat chronograph with ceramic bezel.",
    },
    {
      title: "Jaeger-LeCoultre Reverso Classic Large Duo",
      brand: "Jaeger-LeCoultre",
      model: "Reverso",
      reference: "Q3848422",
      year: 2019,
      condition: "Excellent",
      priceEurCents: 835000,
      location: "Beograd, Srbija",
      description: "Dual time Reverso with manual wind movement.",
    },
    {
      title: "Glashütte Original SeaQ Panorama Date",
      brand: "Glashütte Original",
      model: "SeaQ Panorama",
      reference: "1-36-13-02-81-70",
      year: 2020,
      condition: "Very Good",
      priceEurCents: 892000,
      location: "Novi Sad, Srbija",
      description: "41mm diver with Panorama date and excellent finishing.",
    },
    {
      title: "Bell & Ross BR 03-92 Diver Blue",
      brand: "Bell & Ross",
      model: "BR 03-92",
      reference: "BR0392-D-BU-ST/SRB",
      year: 2022,
      condition: "Like New",
      priceEurCents: 318000,
      location: "Beograd, Srbija",
      description: "Square case diver with blue dial, complete set.",
    },
    {
      title: "Oris Aquis Date Calibre 400",
      brand: "Oris",
      model: "Aquis Date",
      reference: "01 400 7769 4157-07 8 22 09PEB",
      year: 2023,
      condition: "New",
      priceEurCents: 245000,
      location: "Split, Hrvatska",
      description: "In-house calibre 400 with 5-day power reserve.",
    },
    {
      title: "Hamilton Khaki Field Mechanical Bronze",
      brand: "Hamilton",
      model: "Khaki Field Mechanical",
      reference: "H69459530",
      year: 2021,
      condition: "Very Good",
      priceEurCents: 49500,
      location: "Kragujevac, Srbija",
      description: "Bronze case with manual wind movement, includes NATO strap.",
    },
    {
      title: "Citizen Promaster Sky Eco-Drive Radio Controlled",
      brand: "Citizen",
      model: "Promaster Sky",
      reference: "CB5860-86E",
      year: 2022,
      condition: "Excellent",
      priceEurCents: 78000,
      location: "Beograd, Srbija",
      description: "Solar powered pilot watch with radio-control and sapphire crystal.",
    },
  ];

  let createdCount = 0;

  for (const data of listingsSeed) {
    const existing = await prisma.listing.findFirst({
      where: {
        sellerId: seller.id,
        title: data.title,
        model: data.model,
      },
    });

    if (!existing) {
      await prisma.listing.create({
        data: {
          sellerId: seller.id,
          status: "APPROVED",
          currency: "EUR",
          gender: (data as { gender?: "MALE" | "FEMALE" | "UNISEX" }).gender ?? "UNISEX",
          ...data,
        },
      });
      createdCount += 1;
    }
  }

  console.log(`Seed complete. Seller "${sellerEmail}" has ${listingsSeed.length} demo listings (${createdCount} created this run).`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

