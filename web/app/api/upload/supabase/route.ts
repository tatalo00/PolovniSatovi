import "server-only";

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    await requireAuth();

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      logger.error("Supabase environment variables not configured");
      return NextResponse.json(
        { error: "Supabase nije konfigurisan. Molimo kontaktirajte administratora." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: "Nijedna datoteka nije priložena" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: "Dozvoljene su samo slike" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Slika je prevelika. Maksimalna veličina je 5MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = fileName;

    // Convert File to ArrayBuffer then to Buffer for Supabase
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ensure supabase is available (checked at module level, but TypeScript needs this)
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase nije konfigurisan. Molimo kontaktirajte administratora." },
        { status: 500 }
      );
    }

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('listings')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      logger.error("Supabase storage upload error", { error: error.message });
      return NextResponse.json(
        { error: error.message || "Greška pri uploadu slike" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('listings')
      .getPublicUrl(filePath);

    logger.info("Image uploaded successfully", { path: filePath });

    return NextResponse.json({
      url: publicUrl,
      path: filePath,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error("Unknown error");

    logger.error("Error uploading image", { error: err.message, stack: err.stack });
    
    // Check if it's an auth error
    if (err.message.includes("Unauthorized") || err.message.includes("auth")) {
      return NextResponse.json(
        { error: "Morate biti prijavljeni da biste uploadovali slike" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: err.message || "Greška pri uploadu slike. Pokušajte ponovo." },
      { status: 500 }
    );
  }
}
