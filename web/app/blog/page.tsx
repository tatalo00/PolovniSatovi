import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata = {
  title: "Blog",
  description: "Inspiracije, vodiči i priče iz sveta satova.",
};

const FEATURED_ARTICLES = [
  {
    title: "Kako prepoznati autentični vintage sat",
    slug: "prepoznaj-autenticni-vintage-sat",
    excerpt:
      "Kompletan vodič kroz detalje kućišta, mehanizma i dokumentacije koji pomažu da razlikujete original od kopije.",
    publishedAt: "12. novembar 2025.",
    readingTime: "7 min",
    tags: ["Vodič", "Autentifikacija"],
    coverGradient: "from-neutral-900 via-neutral-800 to-neutral-700",
  },
  {
    title: "Top 5 investicionih satova za 2026. godinu",
    slug: "investicioni-satovi-2026",
    excerpt:
      "Pregled modela koji beleže stabilan rast vrednosti i zašto bi trebalo da budu deo ozbiljne kolekcije.",
    publishedAt: "03. novembar 2025.",
    readingTime: "6 min",
    tags: ["Investicija", "Tržište"],
    coverGradient: "from-amber-500 via-amber-600 to-neutral-900",
  },
  {
    title: "Servis vintage mehanizama: šta obavezno uraditi",
    slug: "servis-vintage-mehanizama",
    excerpt:
      "Pripremili smo listu preporučenih servisa i opremu koju bi svaki kolekcionar trebalo da poseduje kod kuće.",
    publishedAt: "27. oktobar 2025.",
    readingTime: "8 min",
    tags: ["Servis", "Održavanje"],
    coverGradient: "from-slate-900 via-slate-800 to-neutral-700",
  },
];

export default function BlogPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <Breadcrumbs items={[{ label: "Blog" }]} className="mb-6" />
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-neutral-500">
          Blog
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-neutral-900">
          Priče, inspiracije i vodiči iz sveta satova
        </h1>
        <p className="mt-6 text-base text-neutral-600">
          Redovno delimo savete o kolekcionarstvu, investiranju, autentifikaciji i servisiranju kako bismo
          vam pomogli da svoju sledeću kupovinu učinite sigurnom i vrednom.
        </p>
      </header>

      <section className="mx-auto mt-12 flex max-w-4xl flex-col gap-8">
        {FEATURED_ARTICLES.map((article) => (
          <Link
            key={article.slug}
            href={`/blog/${article.slug}`}
            className="group block overflow-hidden rounded-3xl border border-neutral-200/70 bg-white/90 shadow-lg backdrop-blur-sm transition hover:-translate-y-1 hover:border-[#D4AF37]/60 hover:shadow-xl"
            aria-label={`Pročitaj članak ${article.title}`}
          >
            <article className="grid gap-0 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <div className={`relative min-h-[180px] bg-gradient-to-br ${article.coverGradient}`}>
                <div className="absolute inset-0 flex h-full w-full flex-col justify-between p-5 text-white">
                  <div className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-white/70">
                    {article.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-white/30 px-3 py-1 text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/70">Objavljeno</p>
                    <p className="text-sm font-semibold text-white">{article.publishedAt}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between p-6 md:p-8">
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900 transition-colors group-hover:text-[#D4AF37]">
                    {article.title}
                  </h2>
                  <p className="mt-4 text-sm text-neutral-600">{article.excerpt}</p>
                </div>
                <div className="mt-6 flex items-center justify-between text-sm text-neutral-500">
                  <span>{article.readingTime} čitanja</span>
                  <span className="inline-flex items-center gap-2 font-semibold text-neutral-800 group-hover:text-[#D4AF37]">
                    Nastavi sa čitanjem
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="h-4 w-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </section>
    </main>
  );
}
