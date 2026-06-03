# next-network-debugger 🚀

A high-performance, dark-themed network telemetry inspector for Next.js. Intercepts both client-side and server-side API calls with zero impact on production bundle size.

## ✨ Features
- 🔍 **Full-Stack Interception**: Catch every `fetch()` call from both Client & Server.
- 🖥️ **Instrumentation Native**: Seamlessly hooks into the Next.js lifecycle.
- 📍 **Source Page Tracking**: See which precise route triggered each server fetch.
- 🎨 **Premium UI**: Zero-MUI, lightweight, and blazing-fast dark mode interface.
- ⚡ **Minimal Overhead**: Zero dependencies; everything is optimized for speed.

## 📦 Install
```bash
npm install next-network-debugger
```

## 🚀 Step-by-Step Setup

### 1. Enable Server-Side Hook (`next.config.mjs`)
Next.js requires the instrumentation hook to be explicitly enabled for server-side tracing.
```javascript
export default {
  experimental: {
    instrumentationHook: true,
  }
};
```

### 2. Register the Interceptor (`instrumentation.ts`)
Create this file in your root (or `src/`) folder. This runs once on server startup.
```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initGlobalFetchLogging } = await import('next-network-debugger/server');
    initGlobalFetchLogging();
  }
}
```

### 3. Add the UI to your Layout (`layout.tsx`)
```tsx
import { NetworkDebugger } from 'next-network-debugger';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        {process.env.NODE_ENV !== 'production' && <NetworkDebugger />}
      </body>
    </html>
  );
}
```

### 4. Optional: Enable Page Tracking (`middleware.ts`)
If you want the debugger to show exactly which page triggered a server-side API call, add this middleware:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-url', request.url);

  return NextResponse.next({
    request: { headers: requestHeaders }
  });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
```

### 5. Create the API Route (`app/api/qa-logs/route.ts`)
```typescript
import { createLogHandler } from 'next-network-debugger/server';

const handler = createLogHandler();
export const GET = handler.GET;
export const DELETE = handler.DELETE;
```

## ⚙️ Configuration
The component accepts several props for customization:
```tsx
<NetworkDebugger 
  pollInterval={3000}        // Frequency to fetch server logs (default 5s)
  maxLogs={50}               // Memory limit for log storage
  enabled={true}             // Force enable/disable the inspector
  apiRoute="/api/qa-logs"    // Custom API endpoint
  position="left"            // 'left' or 'right'
/>
```

## 📄 License
MIT © Ali Tahir
