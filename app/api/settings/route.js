import { NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/data';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
};

export async function GET() {
  try {
    let finalSettings = null;

    // 1. Fetch from Supabase
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: dbSets, error: sbErr } = await supabaseAdmin
          .from('settings')
          .select('*')
          .eq('id', 'app_settings')
          .maybeSingle();

        if (!sbErr && dbSets) {
          const platforms = dbSets.platforms || {};
          const branding = platforms._branding || {
            logoUrl: '/logo.png',
            iconUrl: '/logo-icon.png'
          };

          finalSettings = {
            n8n: {
              webhookUrl: dbSets.n8n_webhook_url || '',
              secretToken: dbSets.n8n_secret_token || '',
              autoDispatch: dbSets.n8n_auto_dispatch !== false
            },
            platforms: dbSets.platforms || {},
            branding
          };
        }
      } catch (e) {
        console.warn('Supabase settings query fallback:', e.message);
      }
    }

    // 2. Fallback to local
    if (!finalSettings) {
      finalSettings = readJSON('settings.json', {
        n8n: {
          webhookUrl: '',
          secretToken: '',
          autoDispatch: true,
          lastTestedAt: null,
          lastStatus: 'ready'
        },
        platforms: {},
        branding: {
          logoUrl: '/logo.png',
          iconUrl: '/logo-icon.png'
        }
      });
      if (!finalSettings.branding) {
        finalSettings.branding = {
          logoUrl: '/logo.png',
          iconUrl: '/logo-icon.png'
        };
      }
    }

    return NextResponse.json(
      {
        success: true,
        settings: finalSettings
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    console.error('Settings GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    let current = readJSON('settings.json', {});

    // Prefer live Supabase state as merge base so partial updates (e.g. branding/n8n) never revert platform toggles
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: dbSets, error: sbFetchErr } = await supabaseAdmin
          .from('settings')
          .select('*')
          .eq('id', 'app_settings')
          .maybeSingle();

        if (!sbFetchErr && dbSets) {
          current = {
            ...current,
            n8n: {
              ...(current.n8n || {}),
              webhookUrl: dbSets.n8n_webhook_url ?? current.n8n?.webhookUrl ?? '',
              secretToken: dbSets.n8n_secret_token ?? current.n8n?.secretToken ?? '',
              autoDispatch: dbSets.n8n_auto_dispatch !== false
            },
            platforms: dbSets.platforms || current.platforms || {},
            branding: dbSets.platforms?._branding || current.branding || {}
          };
        }
      } catch (e) {
        console.warn('Supabase pre-merge read fallback:', e.message);
      }
    }

    const updated = {
      ...current,
      ...body,
      n8n: {
        ...current.n8n,
        ...(body.n8n || {})
      },
      platforms: {
        ...current.platforms,
        ...(body.platforms || {}),
        _branding: {
          ...(current.platforms?._branding || {}),
          ...(body.branding || current.branding || {})
        }
      },
      branding: {
        ...(current.branding || current.platforms?._branding || {}),
        ...(body.branding || {})
      }
    };

    // 1. Save to Supabase
    if (isSupabaseConfigured && supabaseAdmin) {
      const { error: sbSaveErr } = await supabaseAdmin.from('settings').upsert([{
        id: 'app_settings',
        n8n_webhook_url: updated.n8n?.webhookUrl || '',
        n8n_secret_token: updated.n8n?.secretToken || '',
        n8n_auto_dispatch: updated.n8n?.autoDispatch !== false,
        platforms: updated.platforms || {},
        updated_at: new Date().toISOString()
      }], { onConflict: 'id' });

      if (sbSaveErr) {
        console.error('Supabase settings save error:', sbSaveErr.message);
        return NextResponse.json({ error: `Failed to save settings: ${sbSaveErr.message}` }, { status: 500 });
      }
    }

    // 2. Also keep local mirror
    writeJSON('settings.json', updated);

    return NextResponse.json(
      {
        success: true,
        message: 'Settings updated successfully',
        settings: updated
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    console.error('Settings POST error:', err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
