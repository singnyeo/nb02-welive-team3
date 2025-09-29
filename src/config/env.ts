import dotenv from 'dotenv';

dotenv.config();

interface Env {
  // Server
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';

  // Database
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_URL: string;

  // JWT
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRATION: number;
  JWT_REFRESH_EXPIRATION: number;

  // CORS
  CORS_ORIGIN: string;
}

const env: Env = {
  // SERVER
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',

  // DATABASE
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
  DB_USERNAME: process.env.DB_USERNAME || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
  DB_NAME: process.env.DB_NAME || 'mydb',
  DB_URL: `postgres://${process.env.DB_USERNAME || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${
    process.env.DB_HOST || 'localhost'
  }:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'mydb'}`,

  // JWT
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || '',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
  JWT_ACCESS_EXPIRATION: parseInt(process.env.JWT_ACCESS_EXPIRATION || '900000', 10),
  JWT_REFRESH_EXPIRATION: parseInt(process.env.JWT_REFRESH_EXPIRATION || '86400000', 10),

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

if (!env.DB_HOST) throw new Error('Missing DB_HOST in environment variables');
if (!env.DB_USERNAME) throw new Error('Missing DB_USERNAME in environment variables');
if (!env.DB_PASSWORD) throw new Error('Missing DB_PASSWORD in environment variables');
if (!env.DB_NAME) throw new Error('Missing DB_NAME in environment variables');
if (!env.JWT_ACCESS_SECRET) throw new Error('Missing JWT_ACCESS_SECRET in environment variables');
if (!env.JWT_REFRESH_SECRET) throw new Error('Missing JWT_REFRESH_SECRET in environment variables');
if (!env.CORS_ORIGIN) throw new Error('Missing CORS_ORIGIN in environment variables');

export default env;
