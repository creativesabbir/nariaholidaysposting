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

// 100% FREE Direct Video Cloud Upload (Litterbox/Catbox)
// 0 Taka, Zero Cost, No API key/credit card needed, bypasses Netlify/Vercel serverless payload limits
export const uploadVideoDirect = async (file, onProgress) => {
  return new Promise((resolve, reject) => {
    try {
      const formData = new FormData();
      formData.append('reqtype', 'fileupload');
      formData.append('time', '72h');
      formData.append('fileToUpload', file, file.name || 'campaign-video.mp4');

      const xhr = new XMLHttpRequest();

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
        const responseText = (xhr.responseText || '').trim();
        if (xhr.status >= 200 && xhr.status < 300 && responseText.startsWith('http')) {
          if (onProgress) {
            onProgress({ percent: 100, loaded: file.size, total: file.size });
          }
          resolve({
            success: true,
            url: responseText,
            filename: file.name,
            originalName: file.name,
            size: file.size,
            type: 'video',
            provider: 'free-litterbox'
          });
        } else {
          // If Litterbox direct fails, fallback to backend upload
          uploadViaBackend(file, onProgress).then(resolve).catch(reject);
        }
      };

      xhr.onerror = () => {
        uploadViaBackend(file, onProgress).then(resolve).catch(reject);
      };

      xhr.ontimeout = () => {
        uploadViaBackend(file, onProgress).then(resolve).catch(reject);
      };

      xhr.open('POST', 'https://litterbox.catbox.moe/resources/internals/api.php');
      xhr.send(formData);
    } catch (err) {
      uploadViaBackend(file, onProgress).then(resolve).catch(reject);
    }
  });
};

const uploadViaBackend = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('media', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

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
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && res.url) {
          if (onProgress) onProgress({ percent: 100, loaded: file.size, total: file.size });
          resolve(res);
        } else {
          reject(new Error(res.error || 'Backend video upload failed'));
        }
      } catch (e) {
        reject(new Error('Invalid response from upload server'));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.ontimeout = () => reject(new Error('Upload request timed out'));

    xhr.open('POST', `${BASE_URL}/upload`);
    xhr.send(formData);
  });
};

export const uploadMediaFile = async (file, onProgress) => {
  // If video, use 100% Free Direct-to-Litterbox Upload (0 Taka, supports up to 1GB!)
  if (file && file.type && file.type.startsWith('video/')) {
    return uploadVideoDirect(file, onProgress);
  }

  // Automatically compress high-res/large images (>2.5MB) before sending over network
  let fileToUpload = file;
  if (file && file.type && file.type.startsWith('image/')) {
    fileToUpload = await compressImageIfNeeded(file);
  }

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof XMLHttpRequest === 'undefined') {
      const formData = new FormData();
      formData.append('media', fileToUpload);
      fetch(`${BASE_URL}/upload`, { method: 'POST', body: formData })
        .then(r => r.json())
        .then(resolve)
        .catch(reject);
      return;
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('media', fileToUpload);

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress({
            percent: Math.min(percent, 98), // Cap at 98% until server finishes processing
            loaded: event.loaded,
            total: event.total
          });
        }
      };
    }

    xhr.onload = () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          if (onProgress) {
            onProgress({ percent: 100, loaded: fileToUpload.size, total: fileToUpload.size });
          }
          resolve(response);
        } else {
          reject(new Error(response.error || `Upload failed (${xhr.status})`));
        }
      } catch (e) {
        reject(new Error('Invalid response from server'));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.ontimeout = () => reject(new Error('Upload request timed out'));

    xhr.open('POST', `${BASE_URL}/upload`);
    xhr.send(formData);
  });
};

export const generateAICaption = async (params) => {
  const res = await fetch(`${BASE_URL}/ai/generate-caption`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return res.json();
};

let cachedSettings = null;
let lastSettingsFetch = 0;

export const fetchSettings = async (force = false) => {
  const now = Date.now();
  if (!force && cachedSettings && (now - lastSettingsFetch < 60000)) {
    return cachedSettings;
  }
  const res = await fetch(`${BASE_URL}/settings`, { cache: 'no-store' });
  const data = await res.json();
  if (data?.success) {
    cachedSettings = data;
    lastSettingsFetch = now;
  }
  return data;
};

export const updateSettings = async (settingsData) => {
  cachedSettings = null;
  const res = await fetch(`${BASE_URL}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settingsData)
  });
  return res.json();
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
