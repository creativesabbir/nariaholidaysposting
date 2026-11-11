import { NextResponse } from 'next/server';
import { readJSON, writeJSON, getCurrentUser } from '@/lib/data';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

let serverPostsCache = null;
let serverPostsCacheTime = 0;

export function invalidatePostsCache() {
  serverPostsCache = null;
  serverPostsCacheTime = 0;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const author = searchParams.get('author');

    const now = Date.now();
    if (!type && !author && serverPostsCache && (now - serverPostsCacheTime < 2000)) {
      return NextResponse.json(serverPostsCache);
    }

    // 1. Query Supabase Production Database
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        let query = supabaseAdmin.from('posts').select('*').order('created_at', { ascending: false }).limit(60);
        if (type) query = query.eq('type', type);
        const { data: sbPosts, error: sbErr } = await query;
        if (!sbErr && sbPosts && sbPosts.length >= 0) {
          let mapped = sbPosts.map(p => ({
            id: p.id,
            type: p.type,
            caption: p.caption,
            mediaUrls: p.media_urls || [],
            thumbnailUrl: p.thumbnail_url,
            platforms: p.platforms || [],
            status: p.status,
            createdAt: p.created_at,
            scheduledAt: p.scheduled_at,
            postedBy: p.posted_by,
            n8nDispatched: p.n8n_dispatched
          }));
          if (author) {
            mapped = mapped.filter(p => p.postedBy?.id === author);
          }
          if (!type && !author) {
            serverPostsCache = mapped;
            serverPostsCacheTime = now;
          }
          return NextResponse.json(mapped);
        }
      } catch (e) {
        console.warn('Supabase posts fetch fallback:', e.message);
      }
    }

    // 2. Fallback to local storage if table not yet migrated
    let posts = readJSON('posts.json', []);
    if (type) {
      posts = posts.filter(p => p.type === type);
    }
    if (author) {
      posts = posts.filter(p => p.postedBy?.id === author);
    }
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (!type && !author) {
      serverPostsCache = posts;
      serverPostsCacheTime = now;
    }
    return NextResponse.json(posts);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    serverPostsCache = null; // Invalidate cache
    const body = await request.json();
    const {
      type = 'image',
      caption = '',
      mediaUrls = [],
      thumbnailUrl = null,
      platforms = [],
      scheduledAt = null
    } = body;

    if (type === 'text' && !caption.trim()) {
      return NextResponse.json({ error: 'Text content is required for text posts' }, { status: 400 });
    }
    if (type !== 'text' && !caption.trim() && mediaUrls.length === 0) {
      return NextResponse.json({ error: 'Caption or media is required' }, { status: 400 });
    }

    const finalMediaUrls = type === 'text' ? [] : mediaUrls;
    const finalThumbnailUrl = type === 'text' ? null : thumbnailUrl;
    const fallbackPlatforms = type === 'text' ? ['facebook', 'linkedin'] : ['facebook', 'instagram'];

    // Identify user from session or current profile
    const sessionCookie = request.cookies.get('nh_session')?.value;
    let author = null;
    if (sessionCookie) {
      try {
        author = JSON.parse(decodeURIComponent(sessionCookie));
      } catch (e) {}
    }
    if (!author) {
      author = getCurrentUser();
    }

    const isScheduled = !!scheduledAt && new Date(scheduledAt) > new Date();

    const newPost = {
      id: `post-${Date.now()}`,
      type,
      caption,
      mediaUrls: finalMediaUrls,
      thumbnailUrl: finalThumbnailUrl,
      platforms: platforms.length > 0 ? platforms : fallbackPlatforms,
      status: isScheduled ? 'scheduled' : 'pending', // Starts as pending until n8n finishes publishing
      createdAt: new Date().toISOString(),
      scheduledAt: isScheduled ? scheduledAt : null,
      postedBy: {
        id: author.id,
        name: author.name,
        email: author.email,
        role: author.role,
        avatar: author.avatar
      },
      likes: 0,
      shares: 0,
      metrics: {
        impressions: 0,
        clicks: 0
      }
    };

    // 1. Save directly into Supabase Production Database
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        await supabaseAdmin.from('posts').insert([{
          id: newPost.id,
          type: newPost.type,
          caption: newPost.caption,
          media_urls: newPost.mediaUrls,
          thumbnail_url: newPost.thumbnailUrl,
          platforms: newPost.platforms,
          status: newPost.status,
          scheduled_at: newPost.scheduledAt,
          created_at: newPost.createdAt,
          posted_by: newPost.postedBy,
          n8n_dispatched: false
        }]);
      } catch (sbInsertErr) {
        console.warn('Supabase post insert fallback:', sbInsertErr.message);
      }
    }

    // 2. Also keep in local storage
    const posts = readJSON('posts.json', []);
    posts.unshift(newPost);
    writeJSON('posts.json', posts);

    // 3. Trigger n8n Automation Webhook (Awaited to ensure serverless execution completes)
    try {
      let n8nUrl = null;
      let secretToken = null;
      let autoDispatch = true;

      if (isSupabaseConfigured && supabaseAdmin) {
        try {
          const { data: dbSettings } = await supabaseAdmin.from('settings').select('*').eq('id', 'app_settings').maybeSingle();
          if (dbSettings) {
            n8nUrl = dbSettings.n8n_webhook_url;
            secretToken = dbSettings.n8n_secret_token;
            autoDispatch = dbSettings.n8n_auto_dispatch !== false;
          }
        } catch (sbSettingsErr) {
          console.warn('Supabase settings fetch fallback:', sbSettingsErr.message);
        }
      }

      if (!n8nUrl) {
        n8nUrl = process.env.N8N_WEBHOOK_URL;
        secretToken = secretToken || process.env.N8N_WEBHOOK_SECRET;
      }

      if (!n8nUrl) {
        const localSettings = readJSON('settings.json', {});
        n8nUrl = localSettings.n8n?.webhookUrl;
        secretToken = secretToken || localSettings.n8n?.secretToken;
        autoDispatch = localSettings.n8n?.autoDispatch !== false;
      }

      if (n8nUrl && autoDispatch && n8nUrl.startsWith('http') && !n8nUrl.includes('your-domain')) {
        const hostHeader = request.headers.get('host') || 'postnariaholidays.netlify.app';
        const proto = request.headers.get('x-forwarded-proto') || 'https';
        const callbackUrl = `${proto}://${hostHeader}/api/webhooks/n8n-callback`;

        const payload = {
          event: isScheduled ? 'post.scheduled' : 'post.publish',
          postId: newPost.id,
          post: newPost,
          platforms: newPost.platforms,
          caption: newPost.caption,
          mediaUrls: newPost.mediaUrls,
          mediaUrl: newPost.mediaUrls?.[0] || '',
          type: newPost.type,
          author: newPost.postedBy,
          publishedBy: newPost.postedBy?.name || 'Abir Hasan Sabbir',
          publishedByEmail: newPost.postedBy?.email || '',
          scheduledAt: newPost.scheduledAt,
          callbackUrl: callbackUrl,
          statusCallbackUrl: callbackUrl,
          callbackMethod: 'POST',
          callbackSampleBody: {
            postId: newPost.id,
            status: 'published'
          },
          timestamp: new Date().toISOString()
        };

        const headers = { 'Content-Type': 'application/json' };
        if (secretToken) {
          headers['X-Webhook-Secret'] = secretToken;
          headers['Authorization'] = `Bearer ${secretToken}`;
        }

        // AWAIT REQUIRED: Prevents Netlify / serverless runtime from abruptly freezing before dispatch completes
        try {
          const n8nRes = await fetch(n8nUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(10000)
          });

          if (n8nRes.ok) {
            newPost.n8nDispatched = true;

            // If n8n responded synchronously with { status: "published" }, update immediately
            try {
              const resJson = await n8nRes.json().catch(() => null);
              if (resJson?.status === 'published' || resJson?.published === true) {
                newPost.status = 'published';
              }
            } catch (e) {}

            if (isSupabaseConfigured && supabaseAdmin) {
              await supabaseAdmin.from('posts').update({ 
                n8n_dispatched: true,
                status: newPost.status 
              }).eq('id', newPost.id);
            }
          } else {
            console.warn('n8n dispatch non-200 status:', n8nRes.status);
          }
        } catch (fetchErr) {
          console.error('n8n fetch dispatch error:', fetchErr.message);
        }
      }
    } catch (e) {
      console.error('n8n webhook handler exception:', e);
    }

    return NextResponse.json({
      success: true,
      message: isScheduled 
        ? 'Post scheduled successfully!' 
        : newPost.status === 'published'
        ? 'Post published successfully!'
        : 'Campaign dispatched to n8n! Status is pending until workflow finishes.',
      post: newPost
    }, { status: 201 });
  } catch (err) {
    console.error('Error in create post:', err);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    invalidatePostsCache();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Role verification: ensure only administrators can delete campaign posts
    const sessionCookie = request.cookies.get('nh_session')?.value;
    let user = null;
    if (sessionCookie) {
      try {
        let val = sessionCookie;
        if (val.includes('%')) val = decodeURIComponent(val);
        if (val.includes('%')) val = decodeURIComponent(val);
        user = JSON.parse(val);
      } catch (e) {}
    }

    const isAdmin = Boolean(user?.isAdmin || user?.role?.toLowerCase().includes('admin'));
    if (!isAdmin) {
      return NextResponse.json({ 
        error: 'Unauthorized: Only admins have permission to delete campaign posts' 
      }, { status: 403 });
    }

    // 1. Delete from Supabase Database
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        await supabaseAdmin.from('posts').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase post delete error:', e.message);
      }
    }

    // 2. Delete from local JSON fallback
    let posts = readJSON('posts.json', []);
    posts = posts.filter(p => p.id !== id);
    writeJSON('posts.json', posts);

    return NextResponse.json({ success: true, message: 'Post removed' });
  } catch (err) {
    console.error('Delete post error:', err);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
