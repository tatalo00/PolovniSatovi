import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/user/profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthenticationStatusCard } from "@/components/user/authentication-status-card";
import { AuthenticationStatus } from "@/components/user/authentication-status-card";
import { Prisma } from "@prisma/client";

export const metadata = {
  title: "Moj Profil",
  description: "Upravljajte svojim profilom",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userId = session.user.id;

  // Fetch user profile
  const userProfile = (await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      locationCountry: true,
      locationCity: true,
      createdAt: true,
      isVerified: true,
      authentication: {
        select: {
          id: true,
          status: true,
          diditSessionId: true,
          diditVerificationId: true,
          diditSessionUrl: true,
          rejectionReason: true,
          statusDetail: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      _count: {
        select: {
          listings: true,
        },
      },
    },
  })) as (Awaited<ReturnType<typeof prisma.user.findUnique>> & {
    authentication: {
      id: string;
      status: AuthenticationStatus;
      diditSessionId: string;
      diditVerificationId: string | null;
      diditSessionUrl: string | null;
      rejectionReason: string | null;
      statusDetail: string | null;
      createdAt: Date;
      updatedAt: Date;
    } | null;
    _count: { listings: number };
    isVerified: boolean;
    createdAt: Date;
  }) | null;

  if (!userProfile) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Moj Profil</h1>
        <p className="text-muted-foreground mt-2">
          Upravljajte svojim ličnim informacijama
        </p>
      </div>

      <ProfileForm
        initialData={{
          name: userProfile.name,
          email: userProfile.email,
          locationCountry: userProfile.locationCountry,
          locationCity: userProfile.locationCity,
        }}
      />

      <AuthenticationStatusCard
        authentication={
          userProfile.authentication
            ? {
                id: userProfile.authentication.id,
                status: userProfile.authentication.status,
                diditSessionUrl: userProfile.authentication.diditSessionUrl,
                diditVerificationId: userProfile.authentication.diditVerificationId,
                rejectionReason: userProfile.authentication.rejectionReason,
                statusDetail: userProfile.authentication.statusDetail,
                updatedAt: userProfile.authentication.updatedAt?.toISOString() ?? null,
                createdAt: userProfile.authentication.createdAt?.toISOString() ?? null,
              }
            : null
        }
        isVerifiedSeller={userProfile.isVerified}
      />

      <Card>
        <CardHeader>
          <CardTitle>Statistike</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Broj oglasa:</span>
            <span className="font-medium">{userProfile._count.listings}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Član od:</span>
            <span className="font-medium">
              {new Date(userProfile.createdAt).toLocaleDateString("sr-RS")}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

