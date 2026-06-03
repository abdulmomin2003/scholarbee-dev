'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import NavLinksServer from './NavLinksServer';

export default function NavLinksClient() {
  const pathname = usePathname();
  const [activePathname, setActivePathname] = useState<string | null>(null);

  useEffect(() => {
    // Set active pathname after hydration to avoid mismatch
    setActivePathname(pathname);
  }, [pathname]);

  // On initial render (server and client), activePathname is null
  // After mount, it gets set to the current pathname
  return <NavLinksServer activePathname={activePathname} />;
}
