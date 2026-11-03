import { NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/data';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const settings = readJSON('settings.json', {});
    const webhookUrl = body.webhookUrl || settings.n8n?.webhookUrl;

    if (!webhookUrl || !webhookUrl.startsWith('http')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or missing n8n webhook URL. Please provide a valid HTTP/HTTPS URL.'
      }, { status: 400 });
    }

    const testPayload = {
      event: 'test_connection',
      source: 'Naria Holidays Social Automation',
      timestamp: new Date().toISOString(),
      message: 'This is a test webhook trigger from Naria Holidays Admin Panel.',
      samplePost: {
        title: 'Dubai Luxury Package 2026',
        caption: 'Explore breathtaking dunes and 5-star luxury with Naria Holidays! #NariaHolidays #Travel',
        platforms: ['facebook', 'instagram']
      }
    };

    const startTime = Date.now();
    let responseStatus = 0;
    let responseText = '';

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (settings.n8n?.secretToken) {
        headers['X-Webhook-Secret'] = settings.n8n.secretToken;
        headers['Authorization'] = `Bearer ${settings.n8n.secretToken}`;
      }

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(testPayload),
        signal: AbortSignal.timeout(8000)
      });

      responseStatus = res.status;
      responseText = await res.text().catch(() => '');
    } catch (fetchErr) {
      console.warn('n8n fetch warning:', fetchErr.message);
      // Even if n8n returns 404 or connection refused because user's instance is local/mock, we report details cleanly
      const latency = Date.now() - startTime;
      
      const updatedSettings = {
        ...settings,
        n8n: {
          ...settings.n8n,
          lastTestedAt: new Date().toISOString(),
          lastStatus: 'connection_error'
        }
      };
      writeJSON('settings.json', updatedSettings);

      return NextResponse.json({
        success: false,
        error: `Could not reach webhook (${fetchErr.message}). Ensure n8n is running and workflow is active.`,
        latencyMs: latency
      });
    }

    const latency = Date.now() - startTime;
    const isSuccess = responseStatus >= 200 && responseStatus < 300;

    const updatedSettings = {
      ...settings,
      n8n: {
        ...settings.n8n,
        lastTestedAt: new Date().toISOString(),
        lastStatus: isSuccess ? 'success' : 'http_error'
      }
    };
    writeJSON('settings.json', updatedSettings);

    return NextResponse.json({
      success: isSuccess,
      statusCode: responseStatus,
      latencyMs: latency,
      message: isSuccess 
        ? `n8n webhook received payload successfully (${responseStatus} OK in ${latency}ms)!`
        : `n8n webhook responded with status ${responseStatus}. Check workflow execution in n8n.`
    });
  } catch (err) {
    console.error('Test n8n error:', err);
    return NextResponse.json({ error: 'Internal test error' }, { status: 500 });
  }
}

