import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  alternates: {
    // Filtered/paginated listing — canonical always points to the clean listing URL
    canonical: 'https://scholarbee.pk/programs'
  }
};

export default function ProgramsLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}
