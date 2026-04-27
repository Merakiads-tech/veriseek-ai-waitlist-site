import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true, service: 'veriseek-waitlist' });
}

export async function POST() {
  return NextResponse.json({ ok: true });
}
