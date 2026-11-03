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

export const uploadMediaFile = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof XMLHttpRequest === 'undefined') {
      const formData = new FormData();
      formData.append('media', file);
      fetch(`${BASE_URL}/upload`, { method: 'POST', body: formData })
        .then(r => r.json())
        .then(resolve)
        .catch(reject);
      return;
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('media', file);

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
            onProgress({ percent: 100, loaded: file.size, total: file.size });
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
