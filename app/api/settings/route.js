import { NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/data';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

let serverSettingsCache = null;
let serverSettingsCacheTime = 0;

export async function GET() {
  try {
    const now = Date.now();
    if (serverSettingsCache && (now - serverSettingsCacheTime < 45000)) {
      return NextResponse.json({
        success: true,
        settings: serverSettingsCache
      });
    }

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
          finalSettings = {
            n8n: {
              webhookUrl: dbSets.n8n_webhook_url || '',
              secretToken: dbSets.n8n_secret_token || '',
              autoDispatch: dbSets.n8n_auto_dispatch !== false
            },
            platforms: dbSets.platforms || {}
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
        platforms: {}
      });
    }

    serverSettingsCache = finalSettings;
    serverSettingsCacheTime = now;

    return NextResponse.json({
      success: true,
      settings: finalSettings
    });
  } catch (err) {
    console.error('Settings GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    serverSettingsCache = null;
    const body = await request.json();
    const current = readJSON('settings.json', {});

    const updated = {
      ...current,
      ...body,
      n8n: {
        ...current.n8n,
        ...(body.n8n || {})
      },
      platforms: {
        ...current.platforms,
        ...(body.platforms || {})
      }
    };

    // 1. Save to Supabase
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        await supabaseAdmin.from('settings').upsert([{
          id: 'app_settings',
          n8n_webhook_url: updated.n8n?.webhookUrl || '',
          n8n_secret_token: updated.n8n?.secretToken || '',
          n8n_auto_dispatch: updated.n8n?.autoDispatch !== false,
          platforms: updated.platforms || {},
          updated_at: new Date().toISOString()
        }], { onConflict: 'id' });
      } catch (sbErr) {
        console.warn('Supabase settings save fallback:', sbErr.message);
      }
    }

    // 2. Also keep local mirror
    writeJSON('settings.json', updated);

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: updated
    });
  } catch (err) {
    console.error('Settings POST error:', err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
