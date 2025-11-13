"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { emailSchema } from "@/lib/validation";
import { cn } from "@/lib/utils";

const forgotPasswordSchema = z.object({
  email: emailSchema,
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm({ className }: { className?: string } = {}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Došlo je do greške");
      }

      setSuccess(true);
      toast.success("Email je poslat! Proverite vašu email adresu.");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-emerald-800 shadow-sm">
        <p className="text-base font-semibold">Email je poslat!</p>
        <p className="mt-2 text-sm">
          Proverite svoju email adresu. Ako nalog postoji, poslaćemo vam link za resetovanje šifre.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-5", className)}>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-neutral-800">
          Email adresa
        </Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="email@example.com"
          disabled={loading}
          required
          className="h-12 rounded-xl border-neutral-200 bg-white/90 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="mt-2 h-12 w-full rounded-xl bg-neutral-900 text-base font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? "Slanje..." : "Pošalji link za resetovanje"}
      </Button>
    </form>
  );
}

