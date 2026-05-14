import { WalletType, TransactionType, Role } from '../generated/prisma/client';
import { prisma } from '../database/prisma';
import { HashUtil } from './hash';

async function main() {
  console.log('🌱 Seeding database...');

  const adminPassword = await HashUtil.hash('Admin123!');
  const userPassword = await HashUtil.hash('User1234!');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@wallet.com' },
    update: {},
    create: {
      email: 'admin@wallet.com',
      password: adminPassword,
      username: 'Admin User',
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@wallet.com' },
    update: {},
    create: {
      email: 'user@wallet.com',
      password: userPassword,
      username: 'Test User',
      role: Role.USER,
    },
  })

  const wallet = await prisma.wallet.create({
    data: {
      name: 'Main Wallet',
      color: '#4CAF50',
      type: WalletType.BANK,
      initBalance: 1000,
      balance: 1200,
      income: 500,
      expense: 300,
      userId: user.id,
    },
  });

  await prisma.transaction.createMany({
    data: [
      {
        title: 'Salary',
        description: 'Monthly salary',
        amount: 500,
        date: '2024-03-01',
        time: '09:00',
        type: TransactionType.INCOME,
        userId: user.id,
        walletId: wallet.id,
        day: 1,
        month: 3,
        year: 2024
      },
      {
        title: 'Groceries',
        description: 'Weekly groceries',
        amount: 150,
        date: '2024-03-05',
        time: '15:30',
        type: TransactionType.EXPENSE,
        day: 5,
        month: 3,
        year: 2024,
        userId: user.id,
        walletId: wallet.id,
      },
      {
        title: 'Electricity Bill',
        description: 'Monthly electricity',
        amount: 80,
        date: '2024-03-10',
        time: '10:00',
        type: TransactionType.EXPENSE,
        day: 10,
        month: 3,
        year: 2024,
        userId: user.id,
        walletId: wallet.id,
      },
    ],
  });

  console.log('✅ Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });