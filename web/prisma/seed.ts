import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local explicitly and override any existing env vars
// This ensures .env.local takes precedence over system environment variables
config({ path: resolve(process.cwd(), ".env.local"), override: true });
config({ path: resolve(process.cwd(), ".env") });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create a demo seller and one listing if none exist
  const existingUsers = await prisma.user.count();
  if (existingUsers === 0) {
    const seller = await prisma.user.create({
      data: {
        email: "seller@example.com",
        name: "Demo Seller",
        role: "SELLER",
        sellerProfile: {
          create: {
            storeName: "Demo Watch Store",
            locationCountry: "RS",
            locationCity: "Beograd",
          },
        },
      },
    });

    await prisma.listing.create({
      data: {
        sellerId: seller.id,
        title: "Rolex Submariner Date",
        brand: "Rolex",
        model: "Submariner",
        reference: "116610LN",
        year: 2018,
        condition: "Very Good",
        priceEurCents: 1050000,
        currency: "EUR",
        description: "Full set, lightly worn.",
        status: "APPROVED",
      },
    });
  }
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


