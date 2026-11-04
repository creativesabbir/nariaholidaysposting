import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(request) {
  try {
    const rawSession = request.cookies.get('nh_session')?.value;
    if (!rawSession) {
      return NextResponse.json(null);
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
        return NextResponse.json(null);
      }
    }

    if (!sessionUser || !sessionUser.email) {
      return NextResponse.json(null);
    }

    // Live verification & sync with Supabase database by exact logged-in email
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: dbUser } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', sessionUser.email.toLowerCase().trim())
          .maybeSingle();

        if (dbUser) {
          const avatarUrl = dbUser.avatar?.startsWith('/uploads/') 
            ? 'https://i.ibb.co/21vvfcbS/abir-hasan-avatar.jpg' 
            : dbUser.avatar;

          return NextResponse.json({
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
            avatar: avatarUrl,
            isAdmin: Boolean(dbUser.is_admin)
          });
        }
      } catch (sbErr) {
        console.warn('Supabase profile fetch error:', sbErr.message);
      }
    }

    if (sessionUser && sessionUser.avatar?.startsWith('/uploads/')) {
      sessionUser.avatar = 'https://i.ibb.co/21vvfcbS/abir-hasan-avatar.jpg';
    }

    // Return the session user exactly as logged in
    return NextResponse.json(sessionUser);
  } catch (err) {
    return NextResponse.json(null);
  }
}
