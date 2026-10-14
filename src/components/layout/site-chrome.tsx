import * as React from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getCurrentUser } from "@/lib/auth/guards";

/** Header, main landmark and footer around a public page. */
export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <>
      <SiteHeader user={user} />
      <main id="main" className="flex flex-1 flex-col">
        {children}
      </main>
      <SiteFooter signedIn={Boolean(user)} />
    </>
  );
}
