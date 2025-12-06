"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { emailSchema } from "@/lib/validation";

const SUBJECT_VALUES = ["general", "technical", "partnership", "other"] as const;

const SUBJECT_OPTIONS = [
  { value: SUBJECT_VALUES[0], label: "Opšta pitanja" },
  { value: SUBJECT_VALUES[1], label: "Tehnička podrška" },
  { value: SUBJECT_VALUES[2], label: "Partnerstva i saradnje" },
  { value: SUBJECT_VALUES[3], label: "Drugo" },
] as const;

const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Ime i prezime mora imati najmanje 2 karaktera")
    .max(100, "Ime i prezime ne može biti duže od 100 karaktera"),
  email: emailSchema,
  subject: z.enum(SUBJECT_VALUES),
  message: z
    .string()
    .min(10, "Poruka mora imati najmanje 10 karaktera")
    .max(2000, "Poruka ne može biti duža od 2000 karaktera"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "general",
      message: "",
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact/general", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Došlo je do greške. Pokušajte ponovo.");
      }

      toast.success("Poruka je uspešno poslata. Odgovorićemo u najkraćem roku.");
      form.reset({
        name: "",
        email: "",
        subject: values.subject,
        message: "",
      });
    } catch (error: any) {
      toast.error(error?.message || "Nije moguće poslati poruku. Pokušajte ponovo kasnije.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="group relative overflow-hidden border-2 border-[#D4AF37]/30 bg-white/98 backdrop-blur-sm shadow-2xl transition-all duration-300 hover:shadow-[#D4AF37]/20 hover:shadow-2xl hover:border-[#D4AF37]/50">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-[#D4AF37]/60 to-transparent" />
      <CardHeader className="relative z-10 pb-4 sm:pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-full bg-[#D4AF37]/10 p-2">
            <MessageSquare className="h-5 w-5 text-[#D4AF37]" aria-hidden />
          </div>
          <CardTitle className="text-lg sm:text-xl md:text-2xl">Pošaljite nam poruku</CardTitle>
        </div>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Popunite formu za opšte upite, podršku ili saradnju. Odgovaramo u roku od 1 radnog dana,
          a često i brže.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <CardContent className="relative z-10 space-y-4 sm:space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ime i prezime</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Unesite puno ime"
                      autoComplete="name"
                      minLength={2}
                      maxLength={100}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="vas@email.com"
                      autoComplete="email"
                      inputMode="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vrsta upita</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Odaberite kategoriju" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SUBJECT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poruka</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Navedite što više detalja kako bismo brže odgovorili."
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 sm:pt-6 border-t border-border/50">
            <p className="text-xs text-muted-foreground sm:text-sm leading-relaxed">
              Slanjem poruke prihvatate da obrađujemo vaše podatke u skladu sa{" "}
              <a href="/privacy" className="text-[#D4AF37] hover:text-[#b6932c] underline underline-offset-2 transition-colors">
                Politikom privatnosti
              </a>
              .
            </p>
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto min-w-[180px] bg-[#D4AF37] hover:bg-[#b6932c] text-neutral-900 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Slanje..." : "Pošalji poruku"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

