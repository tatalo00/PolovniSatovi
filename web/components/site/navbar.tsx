"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessagesNavLink } from "@/components/messages/messages-nav-link";
import { cn } from "@/lib/utils";

type TopBrandGroups = {
  men: string[];
  women: string[];
};

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link 
      href={href} 
      className={`transition-colors ${
        isActive 
          ? "text-foreground font-medium" 
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
      {isActive && (
        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary" />
      )}
    </Link>
  );
}

export function Navbar() {
  const { data: session, status } = useSession();

  const isLoggedIn = status === "authenticated";
  const user = session?.user;
  const pathname = usePathname() ?? "/";

  const [topBrandGroups, setTopBrandGroups] = useState<TopBrandGroups>({
    men: [],
    women: [],
  });
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brandsError, setBrandsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const loadBrands = async () => {
      setBrandsLoading(true);
      try {
        const response = await fetch("/api/brands/top", { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Status ${response.status}`);
        }
        const data = (await response.json()) as Partial<TopBrandGroups>;
        if (!cancelled) {
          setTopBrandGroups({
            men: Array.isArray(data.men) ? data.men : [],
            women: Array.isArray(data.women) ? data.women : [],
          });
          setBrandsError(null);
        }
      } catch (error: unknown) {
        if (
          error &&
          typeof error === "object" &&
          "name" in error &&
          (error as { name?: string }).name === "AbortError"
        ) {
          return;
        }
        if (!cancelled) {
          setBrandsError(error instanceof Error ? error.message : "Nepoznata greška");
        }
      } finally {
        if (!cancelled) {
          setBrandsLoading(false);
        }
      }
    };

    loadBrands();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const menBrands = useMemo(
    () => topBrandGroups.men.slice(0, 10),
    [topBrandGroups.men]
  );
  const womenBrands = useMemo(
    () => topBrandGroups.women.slice(0, 10),
    [topBrandGroups.women]
  );

  const isListingsActive = pathname === "/listings" || pathname.startsWith("/listings/");

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const buildListingHref = (gender: "male" | "female", brand?: string) => {
    const params = new URLSearchParams({ gender });
    if (brand) {
      params.set("brand", brand);
    }
    return `/listings?${params.toString()}`;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold tracking-tight">
            PolovniSatovi
          </Link>
          <nav className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList className="gap-6">
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      "bg-transparent px-0 py-0 text-base font-normal text-muted-foreground hover:bg-transparent hover:text-foreground focus:bg-transparent focus:text-foreground focus-visible:outline-none focus-visible:ring-0 data-[state=open]:text-foreground",
                      isListingsActive && "text-foreground font-medium"
                    )}
                  >
                    <span className="relative flex items-center gap-1">
                      Oglasi
                      {isListingsActive && (
                        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary" />
                      )}
                    </span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="md:w-[560px]">
                    <div className="rounded-md border bg-popover p-4 shadow-lg md:p-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Muški satovi
                          </p>
                          <div className="mt-3 space-y-1.5">
                            {brandsLoading ? (
                              <span className="text-sm text-muted-foreground">Učitavanje...</span>
                            ) : menBrands.length > 0 ? (
                              menBrands.map((brand) => (
                                <NavigationMenuLink asChild key={`men-${brand}`}>
                                  <Link
                                    href={buildListingHref("male", brand)}
                                    className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                                  >
                                    <span>{brand}</span>
                                  </Link>
                                </NavigationMenuLink>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                {brandsError ? "Nije moguće učitati brendove" : "Nema dostupnih brendova"}
                              </span>
                            )}
                          </div>
                          <NavigationMenuLink asChild>
                            <Link
                              href={buildListingHref("male")}
                              className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
                            >
                              Pogledaj sve muške oglase
                            </Link>
                          </NavigationMenuLink>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Ženski satovi
                          </p>
                          <div className="mt-3 space-y-1.5">
                            {brandsLoading ? (
                              <span className="text-sm text-muted-foreground">Učitavanje...</span>
                            ) : womenBrands.length > 0 ? (
                              womenBrands.map((brand) => (
                                <NavigationMenuLink asChild key={`women-${brand}`}>
                                  <Link
                                    href={buildListingHref("female", brand)}
                                    className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                                  >
                                    <span>{brand}</span>
                                  </Link>
                                </NavigationMenuLink>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                {brandsError ? "Nije moguće učitati brendove" : "Nema dostupnih brendova"}
                              </span>
                            )}
                          </div>
                          <NavigationMenuLink asChild>
                            <Link
                              href={buildListingHref("female")}
                              className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
                            >
                              Pogledaj sve ženske oglase
                            </Link>
                          </NavigationMenuLink>
                        </div>
                      </div>
                      <p className="mt-4 text-xs text-muted-foreground">
                        Muški i ženski izbor uključuje i uniseks modele pa dobijate širu ponudu.
                      </p>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <div className="relative">
                      <NavLink href="/sell">Prodaj</NavLink>
                    </div>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {isLoggedIn ? (
            <>
              <MessagesNavLink />
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user?.name?.charAt(0).toUpperCase() ||
                          user?.email?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name || "Korisnik"}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/wishlist">Lista želja</Link>
                  </DropdownMenuItem>
                  {session?.user && "role" in session.user && session.user.role === "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>Odjavi se</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/signin">Prijava</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Registracija</Link>
              </Button>
            </>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Otvori meni" className="h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>PolovniSatovi</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-3">
                <NavLink href="/listings">Oglasi</NavLink>
                <NavLink href="/sell">Prodaj</NavLink>
                {isLoggedIn ? (
                  <>
                    <NavLink href="/dashboard/messages">Poruke</NavLink>
                    <NavLink href="/dashboard">Dashboard</NavLink>
                    <NavLink href="/dashboard/wishlist">Lista želja</NavLink>
                    {session?.user && "role" in session.user && session.user.role === "ADMIN" && (
                      <NavLink href="/admin">Admin Panel</NavLink>
                    )}
                    <div className="pt-4 border-t">
                      <Button variant="outline" onClick={handleSignOut} className="w-full">
                        Odjavi se
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="pt-4 border-t space-y-2">
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/auth/signin">Prijava</Link>
                      </Button>
                      <Button asChild className="w-full">
                        <Link href="/auth/signup">Registracija</Link>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default Navbar;


