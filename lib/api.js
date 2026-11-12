import { compressImageIfNeeded } from './imageOptimizer';

const BASE_URL = '/api';

export const fetchUsers = async () => {
  const res = await fetch(`${BASE_URL}/users`, { cache: 'no-store' });
  return res.json();
};

export const fetchCurrentUser = async () => {
  const res = await fetch(`${BASE_URL}/users/current`, { cache: 'no-store' });
  return res.json();
};



export const createUser = async (userData) => {
  const res = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return res.json();
};

export const deleteUser = async (userId) => {
  const res = await fetch(`${BASE_URL}/users?id=${userId}`, {
    method: 'DELETE'
  });
  return res.json();
};

export const updateCurrentUser = async (userData) => {
  const res = await fetch(`${BASE_URL}/users/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return res.json();
};

export const fetchAccounts = async () => {
  const res = await fetch(`${BASE_URL}/accounts`, { cache: 'no-store' });
  return res.json();
};

export const toggleAccount = async (accountId) => {
  const res = await fetch(`${BASE_URL}/accounts/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accountId })
  });
  return res.json();
};

export const fetchPosts = async (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  const res = await fetch(`${BASE_URL}/posts${query ? `?${query}` : ''}`, { cache: 'no-store' });
  return res.json();
};

export const createPost = async (postData) => {
  const res = await fetch(`${BASE_URL}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData)
  });
  return res.json();
};

export const deletePost = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/posts/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const fallbackRes = await fetch(`${BASE_URL}/posts?id=${id}`, {
        method: 'DELETE'
      });
      return fallbackRes.json();
    }
    return res.json();
  } catch (err) {
    const fallbackRes = await fetch(`${BASE_URL}/posts?id=${id}`, {
      method: 'DELETE'
    });
    return fallbackRes.json();
  }
};

const MAX_SUPABASE_VIDEO_BYTES = 48 * 1024 * 1024;
const MAX_TMPFILES_VIDEO_BYTES = 100 * 1024 * 1024;
const SERVERLESS_BODY_SAFE_BYTES = 4.5 * 1024 * 1024;

const isVideoFile = (file) =>
  Boolean(file && (file.type?.startsWith('video/') || /\.(mp4|mov|webm|m4v|avi|mkv)$/i.test(file.name || '')));

const getVideoMimeType = (file) => {
  if (file?.type?.startsWith('video/')) return file.type;
  const lower = (file?.name || '').toLowerCase();
  if (lower.endsWith('.mov')) return 'video/quicktime';
  if (lower.endsWith('.webm')) return 'video/webm';
  return 'video/mp4';
};

const getSafeVideoFilename = (file) => {
  const lower = (file?.name || '').toLowerCase();
  const match = lower.match(/\.(mp4|mov|webm|m4v)$/);
  const ext = match ? match[0] : (lower.endsWith('.mkv') ? '.mp4' : '.mp4');
  return `campaign-video${ext}`;
};

const isLocalHostRuntime = () =>
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const uploadXhr = ({ method = 'POST', url, body, headers = {}, timeoutMs = 180000, onProgress }) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.timeout = timeoutMs;

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress({
            percent: Math.min(percent, 98),
            loaded: event.loaded,
            total: event.total
          });
        }
      };
    }

    xhr.onload = () => {
      resolve({ status: xhr.status, responseText: xhr.responseText || '' });
    };

    xhr.onerror = () => reject(new Error('Network/CORS error during upload'));
    xhr.ontimeout = () => reject(new Error('Upload request timed out'));

    xhr.open(method, url);
    for (const [k, v] of Object.entries(headers)) {
      xhr.setRequestHeader(k, v);
    }
    xhr.send(body);
  });
};

const uploadVideoToSupabase = async (file, onProgress) => {
  if (file.size > MAX_SUPABASE_VIDEO_BYTES) {
    throw new Error('Video exceeds 48 MB Supabase direct upload limit');
  }

  const initRes = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'get-signed-video-upload',
      fileName: file.name || 'campaign-video.mp4',
      contentType: getVideoMimeType(file),
      fileSize: file.size
    })
  });

  const initData = await initRes.json().catch(() => null);
  if (!initRes.ok || !initData?.supported || !initData?.signedUrl || !initData?.publicUrl) {
    throw new Error(initData?.reason || 'Supabase signed upload unavailable');
  }

  const { status, responseText } = await uploadXhr({
    method: 'PUT',
    url: initData.signedUrl,
    body: file,
    headers: { 'Content-Type': getVideoMimeType(file) },
    onProgress
  });

  if (status < 200 || status >= 300) {
    throw new Error(`Supabase storage rejected upload (${status}): ${responseText.slice(0, 120)}`);
  }

  if (onProgress) {
    onProgress({ percent: 100, loaded: file.size, total: file.size });
  }

  return {
    success: true,
    url: initData.publicUrl,
    filename: file.name,
    originalName: file.name,
    size: file.size,
    type: 'video',
    provider: 'supabase-storage'
  };
};

const uploadVideoToTmpfiles = async (file, onProgress) => {
  if (file.size > MAX_TMPFILES_VIDEO_BYTES) {
    throw new Error('Video exceeds 100 MB tmpfiles limit');
  }

  const formData = new FormData();
  formData.append('expire', '172800'); // 48 hours
  formData.append('file', file, getSafeVideoFilename(file));

  const { status, responseText } = await uploadXhr({
    method: 'POST',
    url: 'https://tmpfiles.org/api/v1/upload',
    body: formData,
    onProgress
  });

  if (status < 200 || status >= 300) {
    throw new Error(`tmpfiles upload failed (${status})`);
  }

  const json = JSON.parse(responseText || '{}');
  const viewUrl = json?.data?.url;
  if (!viewUrl) {
    throw new Error('tmpfiles returned no URL');
  }

  let finalUrl = viewUrl.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
  try {
    const resolveRes = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resolve-tmpfiles', viewUrl })
    });
    const resolveData = await resolveRes.json().catch(() => null);
    if (resolveRes.ok && resolveData?.url) {
      finalUrl = resolveData.url;
    }
  } catch (e) {}

  if (onProgress) {
    onProgress({ percent: 100, loaded: file.size, total: file.size });
  }

  return {
    success: true,
    url: finalUrl,
    filename: file.name,
    originalName: file.name,
    size: file.size,
    type: 'video',
    provider: 'free-tmpfiles'
  };
};

const uploadVideoToLitterbox = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('time', '72h');
  formData.append('fileToUpload', file, getSafeVideoFilename(file));

  const { status, responseText } = await uploadXhr({
    method: 'POST',
    url: 'https://litterbox.catbox.moe/resources/internals/api.php',
    body: formData,
    onProgress
  });

  const cleanUrl = responseText.trim();
  if (status < 200 || status >= 300 || !cleanUrl.startsWith('http')) {
    throw new Error(`Litterbox upload failed (${status})`);
  }

  if (onProgress) {
    onProgress({ percent: 100, loaded: file.size, total: file.size });
  }

  return {
    success: true,
    url: cleanUrl,
    filename: file.name,
    originalName: file.name,
    size: file.size,
    type: 'video',
    provider: 'free-litterbox'
  };
};

// Direct-to-cloud video upload (bypasses Netlify's 6MB serverless body limit)
export const uploadVideoDirect = async (file, onProgress) => {
  const providers = [];
  if (file.size <= MAX_SUPABASE_VIDEO_BYTES) {
    providers.push({ name: 'Supabase Storage', fn: uploadVideoToSupabase });
  }
  if (file.size <= MAX_TMPFILES_VIDEO_BYTES) {
    providers.push({ name: 'tmpfiles', fn: uploadVideoToTmpfiles });
  }
  providers.push({ name: 'Litterbox', fn: uploadVideoToLitterbox });

  const errors = [];
  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    try {
      if (i > 0 && onProgress) {
        onProgress({ percent: 5, loaded: 0, total: file.size });
      }
      return await provider.fn(file, onProgress);
    } catch (err) {
      console.warn(`${provider.name} direct video upload failed:`, err.message);
      errors.push(`${provider.name}: ${err.message}`);
    }
  }

  // Only route through /api/upload if file fits under serverless 6MB limit or running locally
  if (file.size <= SERVERLESS_BODY_SAFE_BYTES || isLocalHostRuntime()) {
    return uploadViaBackend(file, onProgress);
  }

  throw new Error(
    `All direct cloud video uploads failed (${errors.join('; ')}). Please check your connection or try a smaller MP4/MOV file.`
  );
};

const uploadViaBackend = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('media', file);

  const { status, responseText } = await uploadXhr({
    method: 'POST',
    url: `${BASE_URL}/upload`,
    body: formData,
    onProgress
  });

  let res = null;
  try {
    res = JSON.parse(responseText);
  } catch (e) {
    if (status === 413) {
      throw new Error('File exceeds server 6 MB upload limit.');
    }
    throw new Error(`Upload server returned an unexpected response (HTTP ${status || 'error'}).`);
  }

  if (status >= 200 && status < 300 && res?.url) {
    if (onProgress) onProgress({ percent: 100, loaded: file.size, total: file.size });
    return res;
  }

  throw new Error(res?.error || `Backend upload failed (HTTP ${status})`);
};

export const uploadMediaFile = async (file, onProgress) => {
  if (isVideoFile(file)) {
    return uploadVideoDirect(file, onProgress);
  }

  // Automatically compress high-res/large images (>2.5MB) before sending over network
  let fileToUpload = file;
  if (file && file.type && file.type.startsWith('image/')) {
    fileToUpload = await compressImageIfNeeded(file);
  }

  if (typeof window === 'undefined' || typeof XMLHttpRequest === 'undefined') {
    const formData = new FormData();
    formData.append('media', fileToUpload);
    const res = await fetch(`${BASE_URL}/upload`, { method: 'POST', body: formData });
    return res.json();
  }

  return uploadViaBackend(fileToUpload, onProgress);
};

export const generateAICaption = async (params) => {
  const res = await fetch(`${BASE_URL}/ai/generate-caption`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return res.json();
};

let inFlightSettingsPromise = null;

export const fetchSettings = async (force = false) => {
  if (!force && inFlightSettingsPromise) {
    return inFlightSettingsPromise;
  }

  const requestPromise = fetch(`${BASE_URL}/settings`, { cache: 'no-store' })
    .then((res) => res.json())
    .finally(() => {
      if (inFlightSettingsPromise === requestPromise) {
        inFlightSettingsPromise = null;
      }
    });

  inFlightSettingsPromise = requestPromise;
  return requestPromise;
};

export const updateSettings = async (settingsData) => {
  inFlightSettingsPromise = null;
  const res = await fetch(`${BASE_URL}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settingsData)
  });
  const data = await res.json();
  if (data?.success && typeof window !== 'undefined') {
    window.dispatchEvent(new Event('nh_settings_updated'));
  }
  return data;
};

export const testN8nWebhook = async (webhookUrl) => {
  const res = await fetch(`${BASE_URL}/settings/test-n8n`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ webhookUrl })
  });
  return res.json();
};

export const loginUser = async (credentials) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return res.json();
};

export const logoutUser = async () => {
  const res = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return res.json();
};

export const fetchAuthSession = async () => {
  const res = await fetch(`${BASE_URL}/auth/me`, { cache: 'no-store' });
  return res.json();
};
