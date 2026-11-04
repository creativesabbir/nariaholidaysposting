import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

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
      // 1. Sync live avatar and details from Supabase production database
      if (isSupabaseConfigured && supabaseAdmin && sessionUser.email) {
        try {
          const { data: dbUser } = await supabaseAdmin
            .from('users')
            .select('name, role, avatar, is_admin')
            .eq('email', sessionUser.email.toLowerCase().trim())
            .maybeSingle();

          if (dbUser) {
            sessionUser.name = dbUser.name || sessionUser.name;
            sessionUser.role = dbUser.role || sessionUser.role;
            sessionUser.avatar = dbUser.avatar || sessionUser.avatar;
            sessionUser.isAdmin = Boolean(dbUser.is_admin);
          }
        } catch (e) {}
      }

      // 2. Safeguard: If avatar still points to old local server path, migrate to cloud CDN URL
      if (sessionUser.avatar && sessionUser.avatar.startsWith('/uploads/')) {
        sessionUser.avatar = 'https://i.ibb.co/21vvfcbS/abir-hasan-avatar.jpg';
      }

      const response = NextResponse.json({
        authenticated: true,
        user: sessionUser
      });

      // Update cookie so browser stays in sync with cloud avatar
      try {
        response.cookies.set('nh_session', encodeURIComponent(JSON.stringify(sessionUser)), {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/'
        });
      } catch (e) {}

      return response;
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
