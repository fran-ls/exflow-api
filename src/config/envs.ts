import dotenv from 'dotenv'
import { User } from '../generated/prisma/client';

dotenv.config()

interface JWT_CONFIG {
  ACCESS_SECRET: string;
  REFRESH_SECRET: string;
  ACCESS_EXPIRES_IN: string;
  REFRESH_EXPIRES_IN: string;
}

interface Envs {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  CORS_ORIGIN?: string;
  USER: User;
  JWT_CONFIG: JWT_CONFIG;
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

const jsonVars = [
  'USER',
  'JWT_CONFIG'
];

for (const v of jsonVars) {
  if (environment[v]) {
    env[v] = JSON.parse(environment[v]);
  }
}

export const envs = env as Envs;