import { NextRequest } from 'next/server';
import { handled, json, participant } from '@/lib/http';
import { individualImpact } from '@/lib/refills';
export async function GET(request: NextRequest) { return handled(async () => json(await individualImpact(participant(request).hash))); }
