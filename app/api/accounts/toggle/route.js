import { NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/data';

export async function POST(request) {
  try {
    const { accountId } = await request.json();
    let accounts = readJSON('accounts.json', []);
    accounts = accounts.map(acc => {
      if (acc.id === accountId) {
        return { ...acc, connected: !acc.connected };
      }
      return acc;
    });
    writeJSON('accounts.json', accounts);
    return NextResponse.json({ success: true, accounts });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to toggle account' }, { status: 500 });
  }
}

