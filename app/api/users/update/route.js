import { NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/data';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request) {
  try {
    const rawSession = request.cookies.get('nh_session')?.value;
    let sessionUser = null;

    if (rawSession) {
      try {
        let val = rawSession;
        if (val.includes('%')) val = decodeURIComponent(val);
        if (val.includes('%')) val = decodeURIComponent(val);
        sessionUser = JSON.parse(val);
      } catch (e) {
        try {
          sessionUser = JSON.parse(rawSession);
        } catch (e2) {}
      }
    }

    const { name, role, email, avatar } = await request.json();
    const targetEmail = (email || sessionUser?.email || '').toLowerCase().trim();

    if (!targetEmail) {
      return NextResponse.json({ error: 'No active user session to update' }, { status: 400 });
    }

    let updatedUser = {
      id: sessionUser?.id || `usr_${Date.now()}`,
      name: name || sessionUser?.name || 'User',
      email: targetEmail,
      role: role || sessionUser?.role || 'Travel Consultant',
      avatar: avatar || sessionUser?.avatar || '',
      isAdmin: Boolean(sessionUser?.isAdmin)
    };

    // 1. Update in Supabase Production Database
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: dbUser, error: updateErr } = await supabaseAdmin
          .from('users')
          .update({
            name: updatedUser.name,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            updated_at: new Date().toISOString()
          })
          .eq('email', targetEmail)
          .select()
          .maybeSingle();

        if (dbUser) {
          updatedUser = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
            avatar: dbUser.avatar,
            isAdmin: Boolean(dbUser.is_admin)
          };
        }

        // Also update Supabase Auth user metadata
        try {
          const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
          const authMatch = userList?.users?.find(u => u.email === targetEmail);
          if (authMatch) {
            await supabaseAdmin.auth.admin.updateUserById(authMatch.id, {
              user_metadata: {
                name: updatedUser.name,
                role: updatedUser.role,
                avatar: updatedUser.avatar,
                is_admin: updatedUser.isAdmin
              }
            });
          }
        } catch (authMetaErr) {}
      } catch (sbErr) {
        console.warn('Supabase profile update warning:', sbErr.message);
      }
    }

    // 2. Mirror in local data
    let users = readJSON('users.json', []);
    const idx = users.findIndex(u => u.email.toLowerCase() === targetEmail);
    if (idx !== -1) {
      users[idx] = {
        ...users[idx],
        name: updatedUser.name,
        role: updatedUser.role,
        avatar: updatedUser.avatar
      };
      writeJSON('users.json', users);
    }

    // 3. Update session cookie
    const response = NextResponse.json({ success: true, user: updatedUser });
    const sessionCookieValue = encodeURIComponent(JSON.stringify(updatedUser));
    response.cookies.set('nh_session', sessionCookieValue, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30
    });

    return response;
  } catch (err) {
    console.error('Update user error:', err);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
