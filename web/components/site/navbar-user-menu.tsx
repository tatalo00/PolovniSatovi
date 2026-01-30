"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { NotificationBell } from "@/components/dashboard/notification-bell";

interface NavUserMenuProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role?: string;
    isVerified?: boolean;
  } | null;
}

export function NavUserMenu({ user }: NavUserMenuProps) {
  const isLoggedIn = !!user;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  if (!isLoggedIn) {
    return (
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
    );
  }

  return (
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
      <NotificationBell />
      <MessagesNavLink />
      <Button variant="ghost" asChild>
        <Link href="/dashboard">Dashboard</Link>
      </Button>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {user.name?.charAt(0).toUpperCase() ||
                  user.email?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user.name || "Korisnik"}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard">Dashboard</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/wishlist">Lista želja</Link>
          </DropdownMenuItem>
          {user.role === "ADMIN" && (
            <DropdownMenuItem asChild>
              <Link href="/admin">Admin Panel</Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>Odjavi se</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
