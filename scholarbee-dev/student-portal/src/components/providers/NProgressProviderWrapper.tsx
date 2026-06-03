'use client';

import { Suspense } from 'react';
import NProgressProvider from './NProgressProvider';

export default function NProgressProviderWrapper({
  children
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<>{children}</>}>
      <NProgressProvider>{children}</NProgressProvider>
    </Suspense>
  );
}
