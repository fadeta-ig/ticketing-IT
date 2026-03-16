import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@it.com' },
    update: {
      passwordHash,
      role: 'ADMIN'
    },
    create: {
      email: 'admin@it.com',
      name: 'Admin IT',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@it.com' },
    update: {
      passwordHash,
      role: 'STAFF'
    },
    create: {
      email: 'staff@it.com',
      name: 'Staff IT',
      passwordHash,
      role: 'STAFF',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@it.com' },
    update: {
      passwordHash,
      role: 'USER'
    },
    create: {
      email: 'user@it.com',
      name: 'Regular User',
      passwordHash,
      role: 'USER',
    },
  });

  console.log('Seeded successfully!');
  console.table([
    { Email: admin.email, Role: admin.role, Password: 'password123' },
    { Email: staff.email, Role: staff.role, Password: 'password123' },
    { Email: user.email, Role: user.role, Password: 'password123' },
  ]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
