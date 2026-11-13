import { NextRequest } from 'next/server';
import { handled, json, mutationGuard, readJson } from '@/lib/http';
import { deletionSchema } from '@/lib/validation';
import { deleteHistory } from '@/lib/refills';
export async function DELETE(request: NextRequest) {
  return handled(async () => {
    const { hash } = mutationGuard(request); deletionSchema.parse(await readJson(request));
    return json({ deleted: await deleteHistory(hash) });
    // Mantém o cookie, logo a atribuição A/B. Não cria um novo participante ao apagar.
  });
}
