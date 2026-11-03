import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
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
      // Primary: Litterbox (100% free, direct stream MP4, 72 hours retention)
      try {
        const videoForm = new FormData();
        videoForm.append('reqtype', 'fileupload');
        videoForm.append('time', '72h');
        const videoBlob = new Blob([buffer], { type: file.type || 'video/mp4' });
        videoForm.append('fileToUpload', videoBlob, file.name || 'campaign-video.mp4');

        const uploadRes = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
          method: 'POST',
          body: videoForm
        });

        const videoUrl = (await uploadRes.text())?.trim();

        if (videoUrl && videoUrl.startsWith('http')) {
          // Keep a local copy in public/uploads for local preview / cache
          try {
            const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
            if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
            fs.writeFileSync(path.join(uploadsDir, filename), buffer);
          } catch (localErr) {}

          return NextResponse.json({
            success: true,
            url: videoUrl,
            filename,
            originalName: file.name,
            size: file.size,
            type: 'video',
            provider: 'free-cloud'
          });
        }
      } catch (litterErr) {
        console.warn('Litterbox upload notice, trying secondary fallback:', litterErr);
      }

      // Secondary free fallback: tmpfiles.org
      try {
        const tmpForm = new FormData();
        const tmpBlob = new Blob([buffer], { type: file.type || 'video/mp4' });
        tmpForm.append('file', tmpBlob, file.name || 'campaign-video.mp4');

        const tmpRes = await fetch('https://tmpfiles.org/api/v1/upload', {
          method: 'POST',
          body: tmpForm
        });
        const tmpJson = await tmpRes.json();
        if (tmpJson?.data?.url) {
          // Convert view URL to direct download URL: https://tmpfiles.org/dl/...
          const directUrl = tmpJson.data.url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
          return NextResponse.json({
            success: true,
            url: directUrl,
            filename,
            originalName: file.name,
            size: file.size,
            type: 'video',
            provider: 'free-cloud'
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
