import { NextRequest } from 'next/server';
import { handled, json } from '@/lib/http';
import { requireAdmin } from '@/lib/admin-guard';
import { researchSnapshot } from '@/lib/research';
export async function GET(request: NextRequest) { return handled(async () => { requireAdmin(request); return json((await researchSnapshot()).metrics); }); }
