"use client";

import type { ButtonHTMLAttributes, MouseEvent } from "react";

import { signOut } from "@/app/lib/api";

interface SignOutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  redirectTo?: string;
}

export function SignOutButton({
  children = "Log Out",
  onClick,
  redirectTo,
  type = "button",
  ...props
}: SignOutButtonProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    signOut(redirectTo);
  }

  return (
    <button type={type} onClick={handleClick} {...props}>
      {children}
    </button>
  );
}
