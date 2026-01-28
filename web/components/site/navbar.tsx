import Link from "next/link";
import { NavLinks } from "./navbar-links";
import { NavUserMenu } from "./navbar-user-menu";
import { NavMobileMenu } from "./navbar-mobile-menu";

interface NavbarUser {
  id: string;
  name: string | null;
  email: string | null;
  role?: string;
  isVerified?: boolean;
}

interface NavbarProps {
  user: NavbarUser | null;
}

export function Navbar({ user }: NavbarProps) {

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="border-b border-border/60">
        <div className="container relative mx-auto flex h-16 items-center justify-between px-4 md:h-20 md:grid md:grid-cols-12">
          <div className="flex items-center md:col-span-3">
            <Link 
              href="/"
              className="text-base font-semibold tracking-tight md:text-lg"
            >
              PolovniSatovi
            </Link>
          </div>
          
          <nav className="pointer-events-none absolute left-1/2 top-1/2 hidden w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 md:flex md:col-span-6 md:static md:translate-x-0 md:translate-y-0 md:justify-center">
            <div className="pointer-events-auto flex w-full items-center justify-center gap-8 lg:gap-10">
              <NavLinks />
            </div>
          </nav>

          <div className="ml-auto hidden items-center justify-end gap-2 md:col-span-3 md:flex">
            <NavUserMenu user={user} />
          </div>

          <div className="ml-auto md:hidden">
            <NavMobileMenu user={user} />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
