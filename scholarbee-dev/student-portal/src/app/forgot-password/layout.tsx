import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://scholarbee.pk/forgot-password' }
};

export default function ForgotPasswordLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}
