-- ========================================================
-- NARIA HOLIDAYS POSTING AUTOMATION - SUPABASE SQL SCHEMA
-- Run this script in your Supabase Project -> SQL Editor
-- ========================================================

-- 1. Users Table (Team members & Admin accounts)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'Travel Consultant',
  is_admin BOOLEAN NOT NULL DEFAULT false,
  avatar TEXT,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Posts Table (Campaigns: Published, Scheduled, Drafts)
CREATE TABLE IF NOT EXISTS public.posts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'image', -- 'image', 'video', or 'text'
  caption TEXT,
  media_urls JSONB DEFAULT '[]'::jsonb,
  thumbnail_url TEXT,
  platforms JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'published', -- 'published', 'scheduled', 'draft', 'failed'
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  posted_by JSONB NOT NULL,
  n8n_dispatched BOOLEAN DEFAULT false
);

-- 3. Automation Settings Table (n8n Webhook & 17 Platform Toggles)
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'app_settings',
  n8n_webhook_url TEXT,
  n8n_secret_token TEXT,
  n8n_auto_dispatch BOOLEAN DEFAULT true,
  platforms JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Security Policies (Full access for Service Role & authenticated app)
DROP POLICY IF EXISTS "Allow all access to users" ON public.users;
CREATE POLICY "Allow all access to users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to posts" ON public.posts;
CREATE POLICY "Allow all access to posts" ON public.posts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to settings" ON public.settings;
CREATE POLICY "Allow all access to settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);

-- Initial Accounts (Abir & Sabbir as verified Admins)
INSERT INTO public.users (id, name, email, role, is_admin, avatar, is_current)
VALUES 
  ('usr_abir', 'Abir Hasan', 'abir@nariaholidays.com', 'Founder & Travel Consultant', true, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80', true),
  ('usr_sabbir', 'Sabbir Ahmed', 'sabbir@nariaholidays.com', 'Social Media & Marketing Lead', true, 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80', false),
  ('usr_naria_ops', 'Naria Holidays Team', 'info@nariaholidays.com', 'Customer Support & Operations', false, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80', false)
ON CONFLICT (id) DO UPDATE SET
  is_admin = EXCLUDED.is_admin,
  role = EXCLUDED.role,
  name = EXCLUDED.name;

-- Initial Settings
INSERT INTO public.settings (id, n8n_webhook_url, n8n_auto_dispatch, platforms)
VALUES (
  'app_settings',
  'https://n8n.your-domain.com/webhook/naria-holidays-post',
  true,
  '{
    "tiktok": {"name": "TikTok", "enabled": true, "status": "active"},
    "instagram": {"name": "Instagram", "enabled": true, "status": "active"},
    "linkedin": {"name": "LinkedIn", "enabled": true, "status": "active"},
    "youtube": {"name": "YouTube", "enabled": true, "status": "active"},
    "facebook": {"name": "Facebook", "enabled": true, "status": "active"},
    "x": {"name": "X", "enabled": true, "status": "active"},
    "pinterest": {"name": "Pinterest", "enabled": true, "status": "active"},
    "reddit": {"name": "Reddit", "enabled": false, "status": "inactive"},
    "threads": {"name": "Threads", "enabled": true, "status": "active"},
    "bluesky": {"name": "Bluesky", "enabled": true, "status": "active"},
    "discord": {"name": "Discord", "enabled": true, "status": "active"},
    "telegram": {"name": "Telegram", "enabled": true, "status": "active"},
    "google_business": {"name": "Google Business", "enabled": true, "status": "active"},
    "slack": {"name": "Slack", "enabled": true, "status": "active"},
    "whop": {"name": "Whop", "enabled": true, "status": "active"},
    "listmonk": {"name": "Listmonk", "enabled": true, "status": "active"},
    "tumblr": {"name": "Tumblr", "enabled": true, "status": "active"}
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;
