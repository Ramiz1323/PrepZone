import dotenv from 'dotenv';
dotenv.config();

const _required = (key) => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing env variable: ${key}`);
  return val;
};

const _optional = (key, fallback = '') => process.env[key] || fallback;

export const env = {
  PORT: parseInt(_optional('PORT', '5000'), 10),
  NODE_ENV: _optional('NODE_ENV', 'development'),
  MONGO_URI: _required('MONGO_URI'),
  JWT_SECRET: _required('JWT_SECRET'),
  JWT_EXPIRES_IN: _optional('JWT_EXPIRES_IN', '7d'),
  CLIENT_URL: _optional('CLIENT_URL', 'http://localhost:5173'),
  MISTRAL_API_KEY: _optional('MISTRAL_API_KEY', ''),
};
