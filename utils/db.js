import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import './config.js'; // ensure DATABASE_URL is populated

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

export default prisma;
