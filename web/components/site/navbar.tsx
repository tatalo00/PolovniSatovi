"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Heart, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
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

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={cn(
        "relative inline-flex items-center text-base font-medium tracking-tight transition-colors",
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
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

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center gap-6 px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          PolovniSatovi
        </Link>
        <nav className="hidden flex-1 justify-center md:flex">
          <div className="flex items-center gap-8 lg:gap-10">
            <NavLink href="/listings">Pogledaj oglase</NavLink>
            <NavLink href="/sell">Prodaj sat</NavLink>
            <NavLink href="/blog">Blog</NavLink>
            <NavLink href="/about">O nama</NavLink>
            <NavLink href="/contact">Kontakt</NavLink>
          </div>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                asChild
                aria-label="Lista želja"
              >
                <Link href="/dashboard/wishlist">
                  <Heart className="h-5 w-5" aria-hidden />
                </Link>
              </Button>
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

        <div className="ml-auto flex items-center gap-2 md:hidden">
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
                <NavLink href="/listings">Pogledaj oglase</NavLink>
                <NavLink href="/sell">Prodaj sat</NavLink>
                <NavLink href="/blog">Blog</NavLink>
                <NavLink href="/about">O nama</NavLink>
                <NavLink href="/contact">Kontakt</NavLink>
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


