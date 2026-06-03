import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://scholarbee.pk/login' }
};

export default function LoginLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}
