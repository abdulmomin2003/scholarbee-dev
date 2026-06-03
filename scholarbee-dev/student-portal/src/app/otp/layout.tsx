import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://scholarbee.pk/otp' }
};

export default function OtpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
