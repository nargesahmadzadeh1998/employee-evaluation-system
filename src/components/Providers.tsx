"use client";

import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "./LanguageProvider";
import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </SessionProvider>
  );
}
