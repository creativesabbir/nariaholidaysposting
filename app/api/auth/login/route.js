import { NextResponse } from 'next/server';
import { readJSON } from '@/lib/data';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email address is required.' },
        { status: 400 }
      );
    }

    if (!password || !password.trim()) {
      return NextResponse.json(
        { success: false, error: 'Password is required.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    let authenticatedUser = null;
    let authToken = null;

    // ========================================================
    // 1. PRODUCTION SUPABASE AUTHENTICATION & ROLE VERIFICATION
    // ========================================================
    if (isSupabaseConfigured && supabase) {
      try {
        // Strict Supabase Auth signIn with password
        const { data: sbAuth, error: sbErr } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: password
        });

        if (!sbErr && sbAuth?.user) {
          authToken = sbAuth.session?.access_token || null;

          // Fetch verified permissions & role from Supabase DB
          if (supabaseAdmin) {
            const { data: profile } = await supabaseAdmin
              .from('users')
              .select('*')
              .eq('email', trimmedEmail)
              .maybeSingle();

            if (profile) {
              authenticatedUser = {
                id: profile.id || sbAuth.user.id,
                name: profile.name || sbAuth.user.user_metadata?.name || trimmedEmail.split('@')[0],
                email: profile.email || trimmedEmail,
                role: profile.role || 'Travel Consultant',
                avatar: profile.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
                isAdmin: Boolean(profile.is_admin)
              };
            }
          }

          if (!authenticatedUser) {
            authenticatedUser = {
              id: sbAuth.user.id,
              name: sbAuth.user.user_metadata?.name || trimmedEmail.split('@')[0],
              email: sbAuth.user.email,
              role: sbAuth.user.user_metadata?.role || 'Team Member',
              avatar: sbAuth.user.user_metadata?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
              isAdmin: Boolean(sbAuth.user.user_metadata?.is_admin)
            };
          }
        } else {
          // If Supabase Auth failed, check if this is an existing database user who needs auth sync
          if (supabaseAdmin) {
            const { data: dbUser } = await supabaseAdmin
              .from('users')
              .select('*')
              .eq('email', trimmedEmail)
              .maybeSingle();

            if (dbUser) {
              // Sync the user's password to Supabase Auth so subsequent logins use strict signIn
              try {
                const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
                const authUser = userList?.users?.find(u => u.email === trimmedEmail);
                if (authUser) {
                  await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
                    password: password,
                    email_confirm: true
                  });
                } else {
                  await supabaseAdmin.auth.admin.createUser({
                    email: trimmedEmail,
                    password: password,
                    email_confirm: true,
                    user_metadata: {
                      name: dbUser.name,
                      role: dbUser.role,
                      is_admin: Boolean(dbUser.is_admin)
                    }
                  });
                }

                authenticatedUser = {
                  id: dbUser.id,
                  name: dbUser.name,
                  email: dbUser.email,
                  role: dbUser.role,
                  avatar: dbUser.avatar,
                  isAdmin: Boolean(dbUser.is_admin)
                };
              } catch (authSyncErr) {
                console.warn('Auth provisioning notice:', authSyncErr.message);
              }
            }
          }

          if (!authenticatedUser) {
            return NextResponse.json(
              { success: false, error: sbErr?.message || 'Invalid email or password.' },
              { status: 401 }
            );
          }
        }
      } catch (authEx) {
        console.error('Supabase Auth error:', authEx.message);
        return NextResponse.json(
          { success: false, error: 'Authentication service unavailable. Please check credentials.' },
          { status: 500 }
        );
      }
    } else {
      // Local fallback only if Supabase is completely unconfigured
      const users = readJSON('users.json', []);
      const found = users.find(u => u.email.toLowerCase() === trimmedEmail);

      if (!found || found.password !== password) {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password.' },
          { status: 401 }
        );
      }

      authenticatedUser = {
        id: found.id,
        name: found.name,
        email: found.email,
        role: found.role,
        avatar: found.avatar,
        isAdmin: Boolean(found.isAdmin)
      };
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Prepare verified session object
    const sessionUser = {
      id: authenticatedUser.id,
      name: authenticatedUser.name,
      email: authenticatedUser.email,
      role: authenticatedUser.role,
      avatar: authenticatedUser.avatar,
      isAdmin: Boolean(authenticatedUser.isAdmin),
      token: authToken || null
    };

    const response = NextResponse.json({
      success: true,
      user: sessionUser
    });

    // Set secure auth cookie
    const sessionCookieValue = encodeURIComponent(JSON.stringify(sessionUser));
    response.cookies.set('nh_session', sessionCookieValue, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Login failed' },
      { status: 500 }
    );
  }
}
