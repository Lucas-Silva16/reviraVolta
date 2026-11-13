import { NextRequest } from 'next/server';
import { handled, json, mutationGuard, readJson } from '@/lib/http';
import { refillSchema } from '@/lib/validation';
import { saveRefill } from '@/lib/refills';
export async function POST(request: NextRequest) {
  return handled(async () => {
    const { hash } = mutationGuard(request);
    const result = await saveRefill(hash, refillSchema.parse(await readJson(request)));
    return json(result, result.replayed ? 200 : 201);
  });
}
