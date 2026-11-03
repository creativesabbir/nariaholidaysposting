import { NextResponse } from 'next/server';

/**
 * High Security: Arbitrary profile switching is completely disabled.
 * Users must authenticate with their email and password through the login portal.
 */
export async function POST() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Unauthenticated profile switching is strictly disabled for security. Please sign out and log in with your credentials.' 
    },
    { status: 403 }
  );
}
