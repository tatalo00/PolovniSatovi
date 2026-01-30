"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, UserCheck, Package, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { SellerTier } from "@/lib/seller-tier";
import { SellerTierBadge } from "@/components/sellers/seller-tier-badge";
import { TransactionBadge } from "@/components/sellers/transaction-badge";

export interface SellerSummary {
  id: string;
  name: string | null;
  email: string;
  locationCity: string | null;
  locationCountry: string | null;
  createdAt: Date;
  isVerified: boolean;
  authenticationStatus: string | null;
  storeName?: string | null;
  shortDescription?: string | null;
  profileSlug?: string | null;
  logoUrl?: string | null;
}

export interface SellerStats {
  activeListings?: number;
  totalSold?: number;
  avgResponseTime?: string;
}

export type SellerBadge = {
  label: string;
  type: "verified" | "authenticated";
} | null;

interface SellerInfoCardProps {
  seller: SellerSummary;
  locationLabel: string | null;
  memberSince: string;
  className?: string;
  badge?: SellerBadge;
  stats?: SellerStats;
  showStats?: boolean;
  sellerTier?: SellerTier;
}

export function SellerInfoCard({
  seller,
  locationLabel,
  memberSince,
  className,
  badge,
  stats,
  showStats = true,
  sellerTier,
}: SellerInfoCardProps) {
  const displayName =
    seller.storeName?.trim() || seller.name?.trim() || seller.email || "Prodavac";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const showProfileLink = badge?.type === "verified" && seller.profileSlug;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Prodavac</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seller Identity */}
        <div className="flex items-start gap-3">
          <div className="relative h-12 w-12 rounded-full bg-neutral-100 overflow-hidden flex items-center justify-center text-sm font-semibold text-neutral-700 flex-shrink-0">
            {seller.logoUrl ? (
              <Image src={seller.logoUrl} alt={displayName} fill sizes="48px" className="object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold flex items-center gap-2 flex-wrap">
              {showProfileLink ? (
                <Link
                  href={`/sellers/${seller.profileSlug}`}
                  className="hover:underline hover:text-[#D4AF37] transition-colors"
                >
                  {displayName}
                </Link>
              ) : (
                displayName
              )}
            </p>
            {badge && (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="mt-1 flex w-fit items-center gap-1.5 border border-white/0 bg-neutral-900/5 text-xs font-semibold text-neutral-700 backdrop-blur cursor-help"
                    >
                      {badge.type === "verified" ? (
                        <ShieldCheck className="h-3.5 w-3.5 text-[#D4AF37]" aria-hidden />
                      ) : (
                        <UserCheck className="h-3.5 w-3.5 text-neutral-900" aria-hidden />
                      )}
                      <span>{badge.label}</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[240px]">
                    {badge.type === "verified" ? (
                      <>
                        <p className="font-medium text-sm">Verifikovani prodavac</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Identitet prodavca je potvrđen KYC verifikacijom. Ovo povećava sigurnost transakcije.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-sm">Autentifikovani korisnik</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Korisnik je prošao autentifikaciju identiteta kroz naš sistem provere.
                        </p>
                      </>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {/* Tier + Transaction badges */}
            {(sellerTier || (stats?.totalSold && stats.totalSold >= 10)) && (
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {sellerTier && <SellerTierBadge tier={sellerTier} />}
                {stats?.totalSold && <TransactionBadge soldCount={stats.totalSold} />}
              </div>
            )}
            {locationLabel && (
              <p className="text-sm text-muted-foreground mt-1">{locationLabel}</p>
            )}
          </div>
        </div>

        {/* Seller Stats */}
        {showStats && stats && (stats.activeListings !== undefined || stats.totalSold !== undefined) && (
          <div className="grid grid-cols-2 gap-2">
            {stats.activeListings !== undefined && (
              <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
                <Package className="h-4 w-4 text-muted-foreground" aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{stats.activeListings}</p>
                  <p className="text-xs text-muted-foreground">Aktivnih oglasa</p>
                </div>
              </div>
            )}
            {stats.totalSold !== undefined && (
              <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{stats.totalSold}</p>
                  <p className="text-xs text-muted-foreground">Prodato</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Response Time */}
        {showStats && stats?.avgResponseTime && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-green-600" aria-hidden />
            <span>
              Odgovara obično <span className="font-medium text-foreground">{stats.avgResponseTime}</span>
            </span>
          </div>
        )}

        {/* Short Description */}
        {seller.shortDescription && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {seller.shortDescription}
          </p>
        )}

        {/* Member Since */}
        <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          Član od{" "}
          <span className="font-medium text-foreground">{memberSince}</span>
        </div>

        {/* Verification Progress (for non-verified sellers) */}
        {!badge && (
          <div className="rounded-md border border-dashed border-muted-foreground/30 px-3 py-2">
            <p className="text-xs text-muted-foreground">
              Ovaj prodavac još uvek nije verifikovan. Preporučujemo dodatnu oprečnost pri kupovini.
            </p>
          </div>
        )}

        {/* Profile Link */}
        {showProfileLink && (
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={`/sellers/${seller.profileSlug}`}>Pogledaj profil prodavca</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for inline use
export function SellerInfoCompact({
  seller,
  badge,
  className,
}: {
  seller: SellerSummary;
  badge?: SellerBadge;
  className?: string;
}) {
  const displayName =
    seller.storeName?.trim() || seller.name?.trim() || seller.email || "Prodavac";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative h-8 w-8 rounded-full bg-neutral-100 overflow-hidden flex items-center justify-center text-xs font-semibold text-neutral-700 flex-shrink-0">
        {seller.logoUrl ? (
          <Image src={seller.logoUrl} alt={displayName} fill sizes="32px" className="object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{displayName}</p>
        {badge && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {badge.type === "verified" ? (
              <ShieldCheck className="h-3 w-3 text-[#D4AF37]" aria-hidden />
            ) : (
              <UserCheck className="h-3 w-3 text-neutral-600" aria-hidden />
            )}
            <span className="truncate">{badge.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
