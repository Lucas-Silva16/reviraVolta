import { randomBytes, scryptSync } from 'node:crypto';
process.env.TOKEN_HMAC_SECRET = randomBytes(32).toString('hex');
process.env.SESSION_SECRET = randomBytes(32).toString('hex');
process.env.APP_ORIGIN = 'http://localhost:3000';
process.env.ADMIN_USERNAME = 'docente';
const salt = randomBytes(16).toString('hex');
process.env.ADMIN_PASSWORD_HASH = `scrypt:${salt}:${scryptSync('test-password-only-123', salt, 64).toString('hex')}`;
process.env.DATA_MODE = 'development';
