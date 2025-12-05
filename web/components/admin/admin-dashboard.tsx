"use client";

import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileText, Shield } from "lucide-react";
import { PriceDisplay } from "@/components/currency/price-display";

interface PendingListing {
  id: string;
  title: string;
  brand: string;
  model: string;
  priceEurCents: number;
  seller: {
    name: string | null;
    email: string;
  };
}

interface RecentReport {
  id: string;
  reason: string;
  listing: {
    id: string;
    title: string;
  };
  reporter: {
    name: string | null;
    email: string | null;
  };
}

interface AdminDashboardProps {
  pendingCount: number;
  openReportsCount: number;
  pendingVerificationsCount: number;
  pendingListings: PendingListing[];
  recentReports: RecentReport[];
}

export function AdminDashboard({
  pendingCount,
  openReportsCount,
  pendingVerificationsCount,
  pendingListings,
  recentReports,
}: AdminDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Čekaju odobrenje</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Oglasa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Otvorene prijave</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openReportsCount}</div>
            <p className="text-xs text-muted-foreground">Prijava</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified prijave</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingVerificationsCount}</div>
            <p className="text-xs text-muted-foreground">Na čekanju</p>
            <Button asChild variant="outline" size="sm" className="mt-2 w-full">
              <Link href="/admin/verifications">Pregled prijava</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Listings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Oglasi za odobrenje</CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/listings">Pogledaj sve</Link>
              </Button>
            </div>
            <CardDescription>Najnoviji oglasi koji čekaju odobrenje</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingListings.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nema oglasa za odobrenje</p>
            ) : (
              <div className="space-y-4">
                {pendingListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-start justify-between border-b pb-4 last:border-0"
                  >
                    <div className="flex-1">
                      <Link
                        href={`/listing/${listing.id}`}
                        className="font-medium hover:underline"
                      >
                        {listing.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {listing.brand} {listing.model} •{" "}
                        <PriceDisplay amountEurCents={listing.priceEurCents} />
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Prodavac: {listing.seller.name || listing.seller.email}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="default" asChild>
                        <Link href={`/admin/listings?status=PENDING#${listing.id}`}>Pregled</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Nedavne prijave</CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/reports">Pogledaj sve</Link>
              </Button>
            </div>
            <CardDescription>Najnovije prijave oglasa</CardDescription>
          </CardHeader>
          <CardContent>
            {recentReports.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nema prijava</p>
            ) : (
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-start justify-between border-b pb-4 last:border-0"
                  >
                    <div className="flex-1">
                      <Link
                        href={`/listing/${report.listing.id}`}
                        className="font-medium hover:underline"
                      >
                        {report.listing.title}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">{report.reason}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Prijavio: {report.reporter.name || report.reporter.email}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/reports?status=OPEN#${report.id}`}>Pregled</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

