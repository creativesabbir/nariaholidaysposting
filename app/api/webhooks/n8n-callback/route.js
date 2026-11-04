import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { readJSON, writeJSON } from '@/lib/data';
import { invalidatePostsCache } from '@/app/api/posts/route';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'online',
    endpoint: '/api/webhooks/n8n-callback',
    description: 'Callback endpoint for n8n automation workflows to update post publication status.',
    expectedPayload: {
      postId: 'post-1793717687359',
      status: 'published' // 'published' | 'failed' | 'pending'
    },
    timestamp: new Date().toISOString()
  });
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    let rawPostId = body.postId || body.id || body.post_id || body.body?.postId || body.data?.postId;
    if (typeof rawPostId === 'string') {
      rawPostId = rawPostId.trim();
      if (rawPostId.startsWith('=')) {
        rawPostId = rawPostId.substring(1).trim();
      }
    }
    const postId = rawPostId;

    let rawStatus = (body.status || body.body?.status || 'published').toString().toLowerCase().trim();
    if (rawStatus.startsWith('=')) {
      rawStatus = rawStatus.substring(1).trim();
    }
    const newStatus = rawStatus;

    if (!postId) {
      return NextResponse.json({ 
        error: 'Missing postId. Please supply { "postId": "...", "status": "published" }' 
      }, { status: 400 });
    }

    const validStatuses = ['published', 'pending', 'scheduled', 'failed'];
    const finalStatus = validStatuses.includes(newStatus) ? newStatus : 'published';

    let updated = false;

    // 1. Update in Supabase Production Database
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('posts')
          .update({
            status: finalStatus,
            updated_at: new Date().toISOString(),
            n8n_dispatched: true
          })
          .eq('id', postId)
          .select();

        if (!error && data && data.length > 0) {
          updated = true;
        }
      } catch (sbErr) {
        console.warn('Supabase status callback update warning:', sbErr.message);
      }
    }

    // 2. Also sync to local JSON
    try {
      const posts = readJSON('posts.json', []);
      const idx = posts.findIndex(p => p.id === postId);
      if (idx !== -1) {
        posts[idx].status = finalStatus;
        posts[idx].updatedAt = new Date().toISOString();
        writeJSON('posts.json', posts);
        updated = true;
      }
    } catch (e) {}

    // 3. Invalidate server-side posts cache so subsequent GET /api/posts shows new status immediately
    invalidatePostsCache();

    return NextResponse.json({
      success: true,
      message: `Post ${postId} status successfully updated to "${finalStatus}".`,
      postId,
      status: finalStatus,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Callback error:', err);
    return NextResponse.json({ error: 'Failed to update post status' }, { status: 500 });
  }
}

