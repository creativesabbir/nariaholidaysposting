import { NextResponse } from 'next/server';
import { readJSON } from '@/lib/data';

export async function GET() {
  const accounts = readJSON('accounts.json', []);
  return NextResponse.json(accounts);
}

