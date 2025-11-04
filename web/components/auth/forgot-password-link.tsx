"use client";

import Link from "next/link";

export function ForgotPasswordLink() {
  return (
    <div className="text-right">
      <Link
        href="/auth/forgot-password"
        className="text-sm text-primary hover:underline"
      >
        Zaboravili ste šifru?
      </Link>
    </div>
  );
}

