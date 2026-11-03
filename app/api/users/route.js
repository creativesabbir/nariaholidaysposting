import { NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/data';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch from Supabase Production Database
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: sbUsers, error: sbErr } = await supabaseAdmin
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (!sbErr && sbUsers && sbUsers.length > 0) {
          const mapped = sbUsers.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            avatar: u.avatar,
            isAdmin: Boolean(u.is_admin),
            isCurrent: Boolean(u.is_current)
          }));
          return NextResponse.json(mapped);
        }
      } catch (e) {
        console.warn('Supabase users query fallback:', e.message);
      }
    }

    // 2. Fallback to local data
    const users = readJSON('users.json', []);
    return NextResponse.json(users);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, role, avatar, isAdmin, password } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    const userRole = role?.trim() || 'Travel Consultant';
    const userAvatar = avatar?.trim() || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';
    const isUserAdmin = Boolean(isAdmin);
    const userPassword = password?.trim() || 'password123';

    const newUser = {
      id: `usr_${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      password: userPassword,
      role: userRole,
      isAdmin: isUserAdmin,
      avatar: userAvatar,
      isCurrent: false,
      createdAt: new Date().toISOString()
    };

    // 1. Save directly into Supabase Production Database
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        // Also provision to Supabase Auth if possible
        try {
          await supabaseAdmin.auth.admin.createUser({
            email: trimmedEmail,
            password: userPassword,
            email_confirm: true,
            user_metadata: {
              name: trimmedName,
              role: userRole,
              avatar: userAvatar,
              is_admin: isUserAdmin
            }
          });
        } catch (authCreateErr) {
          // If already in auth, ignore
        }

        await supabaseAdmin.from('users').upsert([{
          id: newUser.id,
          name: trimmedName,
          email: trimmedEmail,
          role: userRole,
          is_admin: isUserAdmin,
          avatar: userAvatar,
          is_current: false,
          created_at: newUser.createdAt
        }], { onConflict: 'email' });
      } catch (sbInsertErr) {
        console.warn('Supabase user insert fallback:', sbInsertErr.message);
      }
    }

    // 2. Also keep in local storage
    const users = readJSON('users.json', []);
    if (!users.some(u => u.email.toLowerCase() === trimmedEmail)) {
      users.push(newUser);
      writeJSON('users.json', users);
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: newUser
    }, { status: 201 });
  } catch (err) {
    console.error('Error creating user:', err);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // 1. Delete from Supabase
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        await supabaseAdmin.from('users').delete().eq('id', userId);
      } catch (sbDelErr) {
        console.warn('Supabase user delete fallback:', sbDelErr.message);
      }
    }

    // 2. Also update local storage
    let users = readJSON('users.json', []);
    users = users.filter(u => u.id !== userId);
    writeJSON('users.json', users);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      remainingUsers: users
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
