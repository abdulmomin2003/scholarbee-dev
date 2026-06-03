'use client';
import React, { Suspense } from 'react';
import ProfileInformation from '../profileInformation';
import { ProfileInformationSkeleton } from '../pageComponents';

const ProfileInformationPage = () => {
  return (
    <Suspense fallback={<ProfileInformationSkeleton />}>
      <ProfileInformation />
    </Suspense>
  );
};

export default ProfileInformationPage;
