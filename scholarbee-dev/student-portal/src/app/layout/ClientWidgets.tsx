'use client';

import { useEffect, useState } from 'react';
import nextDynamic from 'next/dynamic';

const DynamicWhatsAppWidget = nextDynamic(
  () => import('@/components/organisms/whatsappWidget'),
  {
    ssr: false
  }
);

const DynamicSocketProvider = nextDynamic(
  () => import('@/components/NotificationSocketProvider'),
  {
    ssr: false
  }
);

const DynamicFacebookPixel = nextDynamic(
  () => import('@/components/organisms/FacebookPixelWrapper'),
  {
    ssr: false
  }
);

const DynamicChatbotGate = nextDynamic(
  () => import('@/components/organisms/chatbotGate'),
  { ssr: false }
);

export default function ClientWidgets() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything on the server to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <>
      <DynamicWhatsAppWidget />
      <DynamicChatbotGate />
      <DynamicSocketProvider />
      <DynamicFacebookPixel />
    </>
  );
}
