import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  alternates: {
    // Filtered search page — canonical points to the parent scholarships listing
    canonical: 'https://scholarbee.pk/scholarships'
  }
};

export default function SearchScholarshipLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}
