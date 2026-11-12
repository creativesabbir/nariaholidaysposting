import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const SUPABASE_MEDIA_BUCKET = 'campaign-media';
const MAX_SUPABASE_VIDEO_BYTES = 48 * 1024 * 1024; // Safe under Supabase Free tier 50MB single-file limit
const VIDEO_RETENTION_DAYS = 14;
const VIDEO_PRUNE_THRESHOLD_BYTES = 650 * 1024 * 1024;
const VALID_VIDEO_EXTS = new Set(['.mp4', '.mov', '.webm', '.m4v']);

function getSafeVideoExt(fileName = '', mimeType = '') {
  const ext = path.extname(fileName || '').toLowerCase();
  if (VALID_VIDEO_EXTS.has(ext)) return ext;
  if (mimeType === 'video/quicktime') return '.mov';
  if (mimeType === 'video/webm') return '.webm';
  return '.mp4';
}

function getSafeVideoFilename(fileName = '', mimeType = '') {
  return `campaign-video${getSafeVideoExt(fileName, mimeType)}`;
}

async function ensureCampaignMediaBucket() {
  const { data: existing, error: getErr } = await supabaseAdmin.storage.getBucket(SUPABASE_MEDIA_BUCKET);
  if (existing && !getErr) return true;

  const { error: createErr } = await supabaseAdmin.storage.createBucket(SUPABASE_MEDIA_BUCKET, {
    public: true,
    allowedMimeTypes: ['video/*', 'image/*']
  });

  if (createErr && !createErr.message?.toLowerCase().includes('already exists')) {
    throw createErr;
  }
  return true;
}

async function pruneOldSupabaseVideos() {
  try {
    const { data: items, error: listErr } = await supabaseAdmin.storage
      .from(SUPABASE_MEDIA_BUCKET)
      .list('videos', { limit: 100, sortBy: { column: 'created_at', order: 'asc' } });

    if (listErr || !Array.isArray(items) || items.length === 0) return;

    const now = Date.now();
    const minDeleteAgeMs = 24 * 60 * 60 * 1000;
    const retentionMs = VIDEO_RETENTION_DAYS * 24 * 60 * 60 * 1000;

    let totalBytes = items.reduce((sum, item) => sum + (item.metadata?.size || 0), 0);
    const candidates = [];

    for (const item of items) {
      if (!item?.name || item.name === '.emptyFolderPlaceholder') continue;
      const createdAtMs = item.created_at ? new Date(item.created_at).getTime() : 0;
      const ageMs = createdAtMs ? now - createdAtMs : retentionMs + 1;
      const size = item.metadata?.size || 0;

      if (ageMs > retentionMs || (totalBytes > VIDEO_PRUNE_THRESHOLD_BYTES && ageMs > minDeleteAgeMs)) {
        candidates.push(`videos/${item.name}`);
        totalBytes -= size;
      }
    }

    if (candidates.length === 0) return;

    // Never prune videos still referenced by pending or scheduled posts
    const protectedUrls = new Set();
    const { data: activePosts } = await supabaseAdmin
      .from('posts')
      .select('media_urls')
      .in('status', ['pending', 'scheduled']);

    if (Array.isArray(activePosts)) {
      for (const post of activePosts) {
        if (Array.isArray(post.media_urls)) {
          for (const url of post.media_urls) {
            if (typeof url === 'string') protectedUrls.add(url);
          }
        }
      }
    }

    const toDelete = candidates.filter((objPath) => {
      for (const url of protectedUrls) {
        if (url.includes(objPath)) return false;
      }
      return true;
    });

    if (toDelete.length > 0) {
      await supabaseAdmin.storage.from(SUPABASE_MEDIA_BUCKET).remove(toDelete);
    }
  } catch (err) {
    console.warn('Supabase video cleanup skipped:', err.message);
  }
}

async function resolveTmpfilesUrl(viewUrl) {
  let parsed;
  try {
    parsed = new URL(viewUrl);
  } catch {
    throw new Error('Invalid tmpfiles URL');
  }

  if (parsed.protocol !== 'https:' || (parsed.hostname !== 'tmpfiles.org' && parsed.hostname !== 'www.tmpfiles.org')) {
    throw new Error('Unsupported URL host');
  }

  let directUrl = parsed.toString();
  try {
    const pageRes = await fetch(directUrl, { signal: AbortSignal.timeout(8000) });
    const pageHtml = await pageRes.text();
    const dlMatch = pageHtml.match(/href=["'](https?:\/\/tmpfiles\.org\/dl\/[^"']+|\/dl\/[^"']+)["']/i);
    if (dlMatch && dlMatch[1]) {
      directUrl = dlMatch[1].startsWith('/') ? `https://tmpfiles.org${dlMatch[1]}` : dlMatch[1];
    } else {
      directUrl = directUrl.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
    }
  } catch {
    directUrl = directUrl.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
  }

  return directUrl;
}

async function handleJsonUploadAction(body) {
  const action = body?.action;

  if (action === 'get-signed-video-upload') {
    if (!isSupabaseConfigured || !supabaseAdmin) {
      return NextResponse.json({ supported: false, reason: 'supabase_not_configured' });
    }

    const fileSize = Number(body.fileSize || 0);
    if (fileSize > MAX_SUPABASE_VIDEO_BYTES) {
      return NextResponse.json({ supported: false, reason: 'exceeds_supabase_limit' });
    }

    try {
      await ensureCampaignMediaBucket();
      await pruneOldSupabaseVideos();

      const ext = getSafeVideoExt(body.fileName, body.contentType);
      const objectPath = `videos/${Date.now()}-${uuidv4().substring(0, 8)}${ext}`;

      const { data: signedData, error: signErr } = await supabaseAdmin.storage
        .from(SUPABASE_MEDIA_BUCKET)
        .createSignedUploadUrl(objectPath);

      if (signErr || !signedData?.signedUrl) {
        return NextResponse.json({
          supported: false,
          reason: signErr?.message || 'failed_to_sign_upload'
        });
      }

      const { data: pubData } = supabaseAdmin.storage
        .from(SUPABASE_MEDIA_BUCKET)
        .getPublicUrl(objectPath);

      return NextResponse.json({
        success: true,
        supported: true,
        signedUrl: signedData.signedUrl,
        path: objectPath,
        publicUrl: pubData?.publicUrl
      });
    } catch (sbErr) {
      console.warn('Supabase signed upload init fallback:', sbErr.message);
      return NextResponse.json({ supported: false, reason: sbErr.message });
    }
  }

  if (action === 'resolve-tmpfiles') {
    if (!body?.viewUrl) {
      return NextResponse.json({ error: 'viewUrl is required' }, { status: 400 });
    }
    const directUrl = await resolveTmpfilesUrl(body.viewUrl);
    return NextResponse.json({ success: true, url: directUrl });
  }

  return NextResponse.json({ error: 'Invalid upload action' }, { status: 400 });
}

export async function POST(request) {
  try {
    const reqContentType = request.headers.get('content-type') || '';
    if (reqContentType.includes('application/json')) {
      const body = await request.json().catch(() => ({}));
      return await handleJsonUploadAction(body);
    }

    const formData = await request.formData();
    const file = formData.get('media');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const isVideo = file.type?.startsWith('video/') || false;
    const isImage = file.type?.startsWith('image/') || (!isVideo && /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(file.name));

    // ========================================================
    // 1. 100% FREE IMGBB CLOUD UPLOAD FOR IMAGES
    // ========================================================
    const imgbbApiKey = process.env.IMGBB_API_KEY || process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    if (isImage && imgbbApiKey && !imgbbApiKey.includes('your_imgbb')) {
      try {
        const base64Image = buffer.toString('base64');
        const imgbbBody = new FormData();
        imgbbBody.append('image', base64Image);
        imgbbBody.append('name', file.name.replace(/\.[^/.]+$/, '') || 'nh-campaign');

        const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey.trim()}`, {
          method: 'POST',
          body: imgbbBody
        });

        const imgbbResult = await imgbbResponse.json();

        if (imgbbResult?.success && imgbbResult?.data?.url) {
          return NextResponse.json({
            success: true,
            url: imgbbResult.data.url,
            displayUrl: imgbbResult.data.display_url || imgbbResult.data.url,
            thumbUrl: imgbbResult.data.thumb?.url || null,
            deleteUrl: imgbbResult.data.delete_url || null,
            filename: file.name,
            originalName: file.name,
            size: file.size,
            type: 'image',
            provider: 'imgbb'
          });
        }
      } catch (imgbbEx) {
        console.error('ImgBB upload notice:', imgbbEx);
      }
    }

    // ========================================================
    // 2. 100% FREE CLOUD HOSTING FOR VIDEOS (Litterbox / Catbox)
    // Up to 1GB free, zero cost, no card/account needed, direct MP4 URL for n8n
    // ========================================================
    const ext = path.extname(file.name) || (isVideo ? '.mp4' : '.jpg');
    const filename = `${Date.now()}-${uuidv4().substring(0, 8)}${ext}`;

    if (isVideo) {
      const safeVideoName = getSafeVideoFilename(file.name, file.type);
      // Primary 100% FREE Video Hosting: Litterbox (Catbox)
      // Completely free forever, 0 Taka, up to 1GB per file, direct raw streaming MP4 for n8n
      try {
        const videoForm = new FormData();
        videoForm.append('reqtype', 'fileupload');
        videoForm.append('time', '72h');
        const videoBlob = new Blob([buffer], { type: file.type || 'video/mp4' });
        videoForm.append('fileToUpload', videoBlob, safeVideoName);

        const uploadRes = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
          method: 'POST',
          body: videoForm
        });

        const videoUrl = (await uploadRes.text())?.trim();

        if (videoUrl && videoUrl.startsWith('http')) {
          return NextResponse.json({
            success: true,
            url: videoUrl,
            filename,
            originalName: file.name,
            size: file.size,
            type: 'video',
            provider: 'free-litterbox'
          });
        }
      } catch (litterErr) {
        console.warn('Litterbox upload notice, trying secondary fallback:', litterErr);
      }

      // Secondary 100% FREE fallback: tmpfiles.org with automated direct stream extractor
      try {
        const tmpForm = new FormData();
        const tmpBlob = new Blob([buffer], { type: file.type || 'video/mp4' });
        tmpForm.append('expire', '172800');
        tmpForm.append('file', tmpBlob, safeVideoName);

        const tmpRes = await fetch('https://tmpfiles.org/api/v1/upload', {
          method: 'POST',
          body: tmpForm
        });
        const tmpJson = await tmpRes.json();
        if (tmpJson?.data?.url) {
          const directUrl = await resolveTmpfilesUrl(tmpJson.data.url);

          return NextResponse.json({
            success: true,
            url: directUrl,
            filename,
            originalName: file.name,
            size: file.size,
            type: 'video',
            provider: 'free-tmpfiles'
          });
        }
      } catch (tmpErr) {
        console.warn('tmpfiles fallback notice:', tmpErr);
      }
    }

    // ========================================================
    // 3. LOCAL STORAGE FALLBACK (If offline)
    // ========================================================
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
      filename,
      originalName: file.name,
      size: file.size,
      type: isVideo ? 'video' : 'image',
      provider: 'local'
    });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 });
  }
}
