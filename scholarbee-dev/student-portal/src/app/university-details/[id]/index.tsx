// import React, { Suspense } from 'react';
// import type { Metadata } from 'next';
// import { fetchUniversityProfileServer } from './serverData';
// import UniversityDetailsClient from './UniversityDetailsClient';
// import DetailPageSkeleton from '@/app/program-details/pageComponents/detailPageSkelton';

// interface UniversityDetailsPageProps {
//   params: Promise<{ id: string }>;
//   searchParams: Promise<{ campusId?: string }>;
// }

// export async function generateMetadata({
//   params
// }: UniversityDetailsPageProps): Promise<Metadata> {
//   const { id } = await params;
//   return {
//     alternates: {
//       canonical: `https://scholarbee.pk/university-details/${id}`
//     }
//   };
// }

// const UniversityDetails = async ({
//   params,
//   searchParams
// }: UniversityDetailsPageProps) => {
//   const { id: universitySlug } = await params;
//   const { campusId } = await searchParams;

//   const universityProfile = await fetchUniversityProfileServer(
//     universitySlug,
//     campusId
//   );

//   if (!universityProfile) {
//     return <DetailPageSkeleton />;
//   }

//   return (
//     <Suspense fallback={<DetailPageSkeleton />}>
//       <UniversityDetailsClient
//         universityProfile={universityProfile}
//         universityId={universityProfile?.university?._id ?? universitySlug}
//         campusId={campusId ?? null}
//       />
//     </Suspense>
//   );
// };

// export default UniversityDetails;
import React from 'react';

const page = () => {
  return <div>page</div>;
};

export default page;
