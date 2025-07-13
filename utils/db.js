import { PrismaClient } from '@prisma/client';
import './config.js'; // ensure DATABASE_URL is populated

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

export default prisma;
