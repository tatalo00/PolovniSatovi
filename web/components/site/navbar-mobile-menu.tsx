"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  Heart, Menu, User, List, PlusCircle, BookOpen, 
  Info, Mail, MessageSquare, LayoutDashboard, Shield, 
  LogOut, LogIn, UserPlus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface NavMobileMenuProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role?: string;
    isVerified?: boolean;
  } | null;
}

const MAIN_NAV_ITEMS: Array<{
  href: string;
  label: string;
  icon: typeof List;
  matchPrefix?: string;
}> = [
  { href: "/listings", label: "Pogledaj oglase", icon: List, matchPrefix: "/listing/" },
  { href: "/sell", label: "Prodaj sat", icon: PlusCircle },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/about", label: "O nama", icon: Info },
  { href: "/contact", label: "Kontakt", icon: Mail },
];

const USER_NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/messages", label: "Poruke", icon: MessageSquare },
  { href: "/dashboard/wishlist", label: "Lista želja", icon: Heart },
] as const;

export function NavMobileMenu({ user }: NavMobileMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname() ?? "/";
  const isLoggedIn = !!user;

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const isActive = (href: string, matchPrefix?: string) => {
    return pathname === href || 
      pathname.startsWith(href) || 
      (matchPrefix && pathname.startsWith(matchPrefix));
  };

  return (
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
                  {user.name?.charAt(0).toUpperCase() ||
                    user.email?.charAt(0).toUpperCase() || <User className="h-5 w-5" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.name || "Korisnik"}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          )}
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-4 space-y-1">
            {/* Main Navigation */}
            <div className="space-y-1">
              {MAIN_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.matchPrefix);
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors min-h-[48px]",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Section */}
            {isLoggedIn && (
              <>
                <div className="border-t my-4"></div>
                <div className="space-y-1">
                  {USER_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors min-h-[48px]",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                  {user?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={handleLinkClick}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors min-h-[48px]",
                        isActive("/admin")
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
            )}
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
  );
}
