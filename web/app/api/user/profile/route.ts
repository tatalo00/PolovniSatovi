import "server-only";

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { emailSchema, nameSchema, validateAndSanitize } from "@/lib/validation";
import { z } from "zod";

const profileUpdateSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  locationCountry: z.string().optional(),
  locationCity: z.string().optional(),
});

// GET - Get current user profile
export async function GET() {
  try {
    const user = await requireAuth();
    const userId = (user as any).id;

    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        locationCountry: true,
        locationCity: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            listings: true,
          },
        },
      },
    });

    return NextResponse.json(userProfile);
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}

// PATCH - Update user profile
export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();
    const userId = (user as any).id;

    const body = await request.json();
    const validation = validateAndSanitize(profileUpdateSchema, body);

    if (validation.success == false) {
      logger.warn("Profile update validation failed", { error: validation.error });
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { name, email, locationCountry, locationCity } = validation.data;

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email je već u upotrebi" },
          { status: 400 }
        );
      }
    }

    // Update user profile
    const updateData: any = {};
    if (name !== undefined) updateData.name = name || null;
    if (email !== undefined) updateData.email = email;
    if (locationCountry !== undefined) updateData.locationCountry = locationCountry || null;
    if (locationCity !== undefined) updateData.locationCity = locationCity || null;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        locationCountry: true,
        locationCity: true,
        image: true,
        createdAt: true,
      },
    });

    logger.info("User profile updated", { userId });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    logger.error("Error updating profile", { error: error.message });
    return NextResponse.json(
      { error: error.message || "Došlo je do greške" },
      { status: 500 }
    );
  }
}

