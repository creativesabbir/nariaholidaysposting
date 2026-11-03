import { NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/data';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { invalidatePostsCache } from '@/app/api/posts/route';

export const dynamic = 'force-dynamic';

export async function DELETE(request, context) {
  try {
    const params = context?.params;
    const resolvedParams = params && typeof params.then === 'function' ? await params : params;
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // 1. Invalidate cache
    try {
      if (typeof invalidatePostsCache === 'function') {
        invalidatePostsCache();
      }
    } catch (e) {}

    // 2. Delete from Supabase Database
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { error: sbErr } = await supabaseAdmin.from('posts').delete().eq('id', id);
        if (sbErr) {
          console.error('Supabase delete post error:', sbErr);
        }
      } catch (e) {
        console.error('Supabase delete post error:', e);
      }
    }

    // 3. Delete from local JSON fallback
    let posts = readJSON('posts.json', []);
    posts = posts.filter(p => p.id !== id);
    writeJSON('posts.json', posts);

    return NextResponse.json({ success: true, message: 'Post removed' });
  } catch (err) {
    console.error('Delete post error:', err);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
