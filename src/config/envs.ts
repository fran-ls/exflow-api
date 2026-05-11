import dotenv from 'dotenv'
import { User } from '../generated/prisma/client';

dotenv.config()

interface Envs {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  CORS_ORIGIN?: string;
  USER?: User;
}

const vars = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'CORS_ORIGIN',
];

const intVars = ['PORT'];
const environment = { ...process.env }
const env: any = {}

for (const v of vars) {
  env[v] = intVars.includes(v) && environment[v] ? parseInt(environment[v]) : environment[v];
}

const k = 'USER';

if (environment[k]) {
  env[k] = JSON.parse(environment[k]);
}

export const envs = env as Envs;