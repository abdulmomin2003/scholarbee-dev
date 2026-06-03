// import React from 'react';
// import type { Metadata } from 'next';
// import { redirect } from 'next/navigation';
// import { fetchProgramDetailsServer } from './serverData';
// import ProgramDetailsClient from './ProgramDetailsClient';
// import { getProgramDetailPath, toUrlSlug } from '@/utils/helperFunctions';

// interface ProgramDetailsPageProps {
//   params: Promise<{ id: string }>;
// }

// export async function generateMetadata(): Promise<Metadata> {
//   return {
//     alternates: {
//       // This route redirects to the slug URL — canonical points to the clean programs listing
//       canonical: `https://scholarbee.pk/programs`
//     },
//     robots: { index: false, follow: true }
//   };
// }

// const ProgramDetails = async ({ params }: ProgramDetailsPageProps) => {
//   const { id: slug } = await params;
//   const programDetails = await fetchProgramDetailsServer(slug);

//   if (programDetails) {
//     const program = programDetails?.program;
//     const campus = programDetails?.admission?.campus;
//     const university = programDetails?.admission?.university;
//     const programSlug = toUrlSlug(
//       [program?.degree_level, program?.major].filter(Boolean).join(' ') ||
//         program?.name ||
//         ''
//     );
//     const citySlug = toUrlSlug(campus?.address?.city || campus?.name || '');
//     const uniSlug = toUrlSlug(university?.slug || university?.name || '');
//     if (programSlug && citySlug && uniSlug) {
//       redirect(
//         getProgramDetailPath({
//           programSlug,
//           citySlug,
//           uniSlug
//         })
//       );
//     }
//   }

//   const error = !programDetails;

//   return (
//     <ProgramDetailsClient
//       programDetails={programDetails}
//       isLoading={false}
//       error={error}
//     />
//   );
// };

// export default ProgramDetails;
import React from 'react';

const page = () => {
  return <div>page</div>;
};

export default page;
