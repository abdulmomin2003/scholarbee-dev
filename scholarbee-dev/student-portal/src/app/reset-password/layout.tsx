import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://scholarbee.pk/reset-password' }
};

export default function ResetPasswordLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}
