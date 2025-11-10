import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/user/profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VerificationStatusCard } from "@/components/user/verification-status-card";

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
  const userProfile = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      locationCountry: true,
      locationCity: true,
      createdAt: true,
      isVerified: true,
      verification: {
        select: {
          id: true,
          status: true,
          diditSessionUrl: true,
          diditVerificationId: true,
          rejectionReason: true,
          statusDetail: true,
          updatedAt: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          listings: true,
        },
      },
    },
  });

  if (!userProfile) {
    redirect("/dashboard");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Moj Profil</h1>
          <p className="text-muted-foreground mt-2">
            Upravljajte svojim ličnim informacijama
          </p>
        </div>

        <div className="space-y-6">
          <ProfileForm
            initialData={{
              name: userProfile.name,
              email: userProfile.email,
              locationCountry: userProfile.locationCountry,
              locationCity: userProfile.locationCity,
            }}
          />

          <VerificationStatusCard
            isVerified={userProfile.isVerified}
            verification={
              userProfile.verification
                ? {
                    id: userProfile.verification.id,
                    status: userProfile.verification.status,
                    diditSessionUrl: userProfile.verification.diditSessionUrl,
                    diditVerificationId: userProfile.verification.diditVerificationId,
                    rejectionReason: userProfile.verification.rejectionReason,
                    statusDetail: userProfile.verification.statusDetail,
                    updatedAt: userProfile.verification.updatedAt?.toISOString() ?? null,
                    createdAt: userProfile.verification.createdAt?.toISOString() ?? null,
                  }
                : null
            }
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
      </div>
    </main>
  );
}

