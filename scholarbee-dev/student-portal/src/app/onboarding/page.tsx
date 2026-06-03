'use client';

import React, { Suspense } from 'react';
import OnboardingFlow from './pageComponents/OnboardingFlow';

const OnboardingPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OnboardingFlow />
    </Suspense>
  );
};

export default OnboardingPage;
