import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

  const existing = await prisma.admin.findUnique({ where: { username } });
  if (existing) {
    console.log('Un admin existe déjà, rien à faire.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.admin.create({ data: { username, passwordHash } });
  console.log(`Compte admin créé : ${username} (change le mot de passe après la 1ère connexion)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
