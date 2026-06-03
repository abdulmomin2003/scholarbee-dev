'use client';

import { Suspense } from 'react';
import FacebookPixel from './facebookPixel';

export default function FacebookPixelWrapper() {
  return (
    <Suspense fallback={null}>
      <FacebookPixel />
    </Suspense>
  );
}
