import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const rawSession = request.cookies.get('nh_session')?.value;

    if (!rawSession) {
      return NextResponse.json({
        authenticated: false,
        user: null
      });
    }

    let sessionUser = null;
    try {
      let val = rawSession;
      if (val.includes('%')) val = decodeURIComponent(val);
      if (val.includes('%')) val = decodeURIComponent(val);
      sessionUser = JSON.parse(val);
    } catch (e) {
      try {
        sessionUser = JSON.parse(rawSession);
      } catch (e2) {
        return NextResponse.json({ authenticated: false, user: null });
      }
    }

    if (sessionUser && sessionUser.id) {
      return NextResponse.json({
        authenticated: true,
        user: sessionUser
      });
    }

    return NextResponse.json({
      authenticated: false,
      user: null
    });
  } catch (err) {
    return NextResponse.json({
      authenticated: false,
      user: null
    });
  }
}
