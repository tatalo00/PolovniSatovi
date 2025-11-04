"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminReportsListProps {
  reports: any[];
  currentStatus: string;
}

export function AdminReportsList({ reports, currentStatus }: AdminReportsListProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState<string | null>(null);

  const handleStatusChange = (status: string) => {
    router.push(`/admin/reports?status=${status}`);
  };

  const handleCloseReport = async (reportId: string) => {
    setProcessing(reportId);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CLOSED" }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Došlo je do greške");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Error closing report:", error);
      alert("Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={currentStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="OPEN">Otvorene</SelectItem>
            <SelectItem value="CLOSED">Zatvorene</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Nema prijava sa ovim statusom
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Link
                        href={`/listing/${report.listing.id}`}
                        className="font-semibold hover:underline"
                      >
                        {report.listing.title}
                      </Link>
                      <Badge variant={report.status === "OPEN" ? "default" : "secondary"}>
                        {report.status === "OPEN" ? "Otvorena" : "Zatvorena"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {report.listing.brand} {report.listing.model}
                    </p>
                    <div className="rounded-md bg-muted p-3 mb-3">
                      <p className="text-sm">{report.reason}</p>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>
                        Prijavio: {report.reporter.name || report.reporter.email}
                      </p>
                      <p>
                        Prodavac: {report.listing.seller.name || report.listing.seller.email}
                      </p>
                      <p>
                        Datum: {new Date(report.createdAt).toLocaleString("sr-RS")}
                      </p>
                    </div>
                  </div>

                  {report.status === "OPEN" && (
                    <div className="ml-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <Link href={`/listing/${report.listing.id}`}>
                          Pregled oglasa
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleCloseReport(report.id)}
                        disabled={processing === report.id}
                      >
                        Zatvori
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

