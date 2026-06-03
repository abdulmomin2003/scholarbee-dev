import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://scholarbee.pk/sign-up' }
};

export default function SignUpLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}
