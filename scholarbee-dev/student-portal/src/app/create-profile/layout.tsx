import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://scholarbee.pk/create-profile' }
};

export default function CreateProfileLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}
