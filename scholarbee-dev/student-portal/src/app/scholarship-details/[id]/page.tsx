import React from 'react';
import type { Metadata } from 'next';
import { fetchScholarshipDetailsServer } from './serverData';
import ScholarshipDetailsClient from './ScholarshipDetailsClient';

interface ScholarshipDetailsPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params
}: ScholarshipDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    alternates: {
      canonical: `https://scholarbee.pk/scholarship-details/${id}`
    }
  };
}

const ScholarshipDetails = async ({ params }: ScholarshipDetailsPageProps) => {
  const { id } = await params;
  const scholarshipDetails = await fetchScholarshipDetailsServer(id);

  const error = !scholarshipDetails;

  return (
    <ScholarshipDetailsClient
      scholarshipDetails={scholarshipDetails}
      isLoading={false}
      error={error}
    />
  );
};

export default ScholarshipDetails;
