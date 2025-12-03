"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Heart, Menu, User, List, PlusCircle, BookOpen, Info, Mail, MessageSquare, LayoutDashboard, Shield, LogOut, LogIn, UserPlus } from "lucide-react";
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
  const router = useRouter();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href);
  };
  
  return (
    <a
      href={href}
      onClick={handleClick}
      className={cn(
        "relative inline-flex items-center text-base font-medium tracking-tight transition-colors cursor-pointer",
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
      {isActive && (
        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary" />
      )}
    </a>
  );
}

export function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const isLoggedIn = status === "authenticated";
  const user = session?.user;
  const pathname = usePathname() ?? "/";

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="border-b border-border/60">
        <div className="container relative mx-auto flex h-16 items-center justify-between px-4 md:h-20 md:grid md:grid-cols-12">
          <div className="flex items-center md:col-span-3">
            <a 
              href="/" 
              onClick={(e) => { e.preventDefault(); router.push("/"); }}
              className="text-base font-semibold tracking-tight md:text-lg cursor-pointer"
            >
              PolovniSatovi
            </a>
          </div>
          <nav className="pointer-events-none absolute left-1/2 top-1/2 hidden w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 md:flex md:col-span-6 md:static md:translate-x-0 md:translate-y-0 md:justify-center">
            <div className="pointer-events-auto flex w-full items-center justify-center gap-8 lg:gap-10">
              <NavLink href="/listings">Pogledaj oglase</NavLink>
              <NavLink href="/sell">Prodaj sat</NavLink>
              <NavLink href="/blog">Blog</NavLink>
              <NavLink href="/about">O nama</NavLink>
              <NavLink href="/contact">Kontakt</NavLink>
            </div>
          </nav>

          <div className="ml-auto hidden items-center justify-end gap-2 md:col-span-3 md:flex">
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
                <DropdownMenu modal={false}>
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
                  <DropdownMenuContent className="w-56" align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
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
                <Button
                  variant="ghost"
                  className="text-foreground hover:bg-[#D4AF37]/15 hover:text-[#D4AF37]"
                  asChild
                >
                  <Link href="/auth/signin">Prijava</Link>
                </Button>
                <Button
                  className="hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-neutral-900 hover:shadow-lg"
                  asChild
                >
                  <Link href="/auth/signup">Registracija</Link>
                </Button>
              </>
            )}
          </div>

          <div className="ml-auto md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Otvori meni" className="h-11 w-11 min-h-[44px] min-w-[44px]">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] sm:w-[400px] p-0 flex flex-col">
                <SheetHeader className="px-4 pt-6 pb-4 border-b">
                  <SheetTitle className="text-xl font-bold">PolovniSatovi</SheetTitle>
                  {isLoggedIn && user && (
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {user?.name?.charAt(0).toUpperCase() ||
                            user?.email?.charAt(0).toUpperCase() || <User className="h-5 w-5" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{user?.name || "Korisnik"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                    </div>
                  )}
                </SheetHeader>
                
                <div className="flex-1 overflow-y-auto">
                  <div className="px-4 py-4 space-y-1">
                    {/* Main Navigation */}
                    <div className="space-y-1">
                      <Link
                        href="/listings"
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors min-h-[48px]",
                          pathname === "/listings" || pathname.startsWith("/listing/")
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <List className="h-5 w-5 flex-shrink-0" />
                        <span>Pogledaj oglase</span>
                      </Link>
                      <Link
                        href="/sell"
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors min-h-[48px]",
                          pathname === "/sell" || pathname.startsWith("/sell")
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <PlusCircle className="h-5 w-5 flex-shrink-0" />
                        <span>Prodaj sat</span>
                      </Link>
                      <Link
                        href="/blog"
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors min-h-[48px]",
                          pathname === "/blog" || pathname.startsWith("/blog")
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <BookOpen className="h-5 w-5 flex-shrink-0" />
                        <span>Blog</span>
                      </Link>
                      <Link
                        href="/about"
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors min-h-[48px]",
                          pathname === "/about" || pathname.startsWith("/about")
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <Info className="h-5 w-5 flex-shrink-0" />
                        <span>O nama</span>
                      </Link>
                      <Link
                        href="/contact"
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors min-h-[48px]",
                          pathname === "/contact" || pathname.startsWith("/contact")
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <Mail className="h-5 w-5 flex-shrink-0" />
                        <span>Kontakt</span>
                      </Link>
                    </div>

                    {/* User Section */}
                    {isLoggedIn ? (
                      <>
                        <div className="border-t my-4"></div>
                        <div className="space-y-1">
                          <Link
                            href="/dashboard"
                            onClick={handleLinkClick}
                            className={cn(
                              "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors min-h-[48px]",
                              pathname === "/dashboard" || pathname.startsWith("/dashboard")
                                ? "bg-primary/10 text-primary"
                                : "text-foreground hover:bg-muted"
                            )}
                          >
                            <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            href="/dashboard/messages"
                            onClick={handleLinkClick}
                            className={cn(
                              "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors min-h-[48px]",
                              pathname === "/dashboard/messages" || pathname.startsWith("/dashboard/messages")
                                ? "bg-primary/10 text-primary"
                                : "text-foreground hover:bg-muted"
                            )}
                          >
                            <MessageSquare className="h-5 w-5 flex-shrink-0" />
                            <span>Poruke</span>
                          </Link>
                          <Link
                            href="/dashboard/wishlist"
                            onClick={handleLinkClick}
                            className={cn(
                              "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors min-h-[48px]",
                              pathname === "/dashboard/wishlist" || pathname.startsWith("/dashboard/wishlist")
                                ? "bg-primary/10 text-primary"
                                : "text-foreground hover:bg-muted"
                            )}
                          >
                            <Heart className="h-5 w-5 flex-shrink-0" />
                            <span>Lista želja</span>
                          </Link>
                          {session?.user && "role" in session.user && session.user.role === "ADMIN" && (
                            <Link
                              href="/admin"
                              onClick={handleLinkClick}
                              className={cn(
                                "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors min-h-[48px]",
                                pathname === "/admin" || pathname.startsWith("/admin")
                                  ? "bg-primary/10 text-primary"
                                  : "text-foreground hover:bg-muted"
                              )}
                            >
                              <Shield className="h-5 w-5 flex-shrink-0" />
                              <span>Admin Panel</span>
                            </Link>
                          )}
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="border-t px-4 py-4 space-y-2">
                  {isLoggedIn ? (
                    <Button 
                      variant="outline" 
                      onClick={handleSignOut} 
                      className="w-full min-h-[48px] text-base font-medium"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Odjavi se
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        asChild
                        className="w-full min-h-[48px] text-base font-medium hover:bg-[#D4AF37]/15 hover:text-[#D4AF37] hover:border-[#D4AF37]"
                      >
                        <Link href="/auth/signin" onClick={handleLinkClick}>
                          <LogIn className="h-5 w-5 mr-2" />
                          Prijava
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="w-full min-h-[48px] text-base font-medium bg-[#D4AF37] hover:bg-[#b6932c] text-neutral-900"
                      >
                        <Link href="/auth/signup" onClick={handleLinkClick}>
                          <UserPlus className="h-5 w-5 mr-2" />
                          Registracija
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;


