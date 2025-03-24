import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Only run this middleware for /api/agent
  if (path.startsWith('/api/agent')) {
    // Check if OPENAI_API_KEY exists
    if (!process.env.OPENAI_API_KEY) {
      return new NextResponse(
        JSON.stringify({
          error: 'OpenAI API key not configured',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/agent',
}; 