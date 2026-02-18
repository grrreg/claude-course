"use client";

import React from "react";
import { ClerkProvider } from "@clerk/nextjs";

// The ClerkProvider from @clerk/nextjs is a client-only component which
// contains state that differs between the server and the browser. Using it
// directly inside a server component (like the root layout) triggers React's
// "tree hydration" mismatch error because the server-rendered tree doesn't
// match what the client expects after hydration. To avoid the mismatch we wrap
// the provider in its own client component and then import it into the layout.

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
