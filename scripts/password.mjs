import { randomBytes, scryptSync } from 'node:crypto';
export function passwordHash(password) {
  const salt = randomBytes(16).toString('hex');
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
if (process.argv[1]?.endsWith('password.mjs')) {
  process.stdout.write('Introduza a palavra-passe por stdin (não use argumentos de shell):\n');
  let input = '';
  for await (const chunk of process.stdin) input += chunk;
  if (input.trim().length < 16) throw new Error('Use pelo menos 16 caracteres.');
  process.stdout.write(`${passwordHash(input.trim())}\n`);
}
