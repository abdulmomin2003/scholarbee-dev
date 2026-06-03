import { createLogHandler } from '@/packages/next-network-debugger/src/server';
import { isProduction } from '@/config/config';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const handler = createLogHandler();

export async function GET() {
  if (isProduction) {
    return NextResponse.json(
      { error: 'Available only in debug mode' },
      { status: 403 }
    );
  }

  return handler.GET();
}

export async function DELETE() {
  if (isProduction) {
    return NextResponse.json(
      { error: 'Available only in debug mode' },
      { status: 403 }
    );
  }

  return handler.DELETE();
}
