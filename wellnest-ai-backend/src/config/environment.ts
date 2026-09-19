import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env['PORT']) || 4100,
  nodeEnv: process.env['NODE_ENV'] || 'development',
  db: {
    type: process.env['DB_TYPE'] || 'sqlite',
    host: process.env['DB_HOST'] || 'localhost',
    port: Number(process.env['DB_PORT']) || 5432,
    username: process.env['DB_USERNAME'] || 'postgres',
    password: process.env['DB_PASSWORD'] || '',
    database: process.env['DB_DATABASE'] || process.env['DB_NAME'] || 'wellnest_ai',
    url: process.env['DATABASE_URL'] || '',
    ssl: process.env['DB_SSL'] !== 'false',
  },
  jwtSecret: process.env['JWT_SECRET'] || 'change-me-in-production',
  jwtExpiresIn: process.env['JWT_EXPIRES_IN'] || '7d',
  corsOrigin: process.env['CORS_ORIGIN'] || 'http://localhost:5173',
};
