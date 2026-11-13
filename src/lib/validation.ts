import { z } from 'zod';
import { COURSES, LIMITS } from './config';
export const refillSchema = z.object({
  curso: z.string().refine(value => COURSES.includes(value), 'Escolhe um curso, Docente ou Funcionário da lista.'),
  litros: z.number().finite().min(LIMITS.minLiters, 'O mínimo é 0,10 L.').max(LIMITS.maxLiters, 'O máximo por registo é 5 L.').refine(n => Math.abs(n * 100 - Math.round(n * 100)) < 1e-8, 'Usa no máximo duas casas decimais.'),
  submissionId: z.uuid('Identificador de submissão inválido.'),
}).strict();
export const deletionSchema = z.object({ confirm: z.literal('ELIMINAR') }).strict();
export const loginSchema = z.object({ username: z.string().min(1).max(120), password: z.string().min(1).max(256) }).strict();
