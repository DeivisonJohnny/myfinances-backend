import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const accountName = 'Nossa Organização';
  // Use a generic email for the agency itself
  const accountEmail = 'admin@admin.com';

  const list = [
    {
      name: 'Deivison Johnny',
      email: 'deivisonjohnny@gmail.com',
      password: '93186145',
      role: Role.ADMIN,
    },
    {
      name: 'Vitoria Oliveira',
      email: 'vitoria@gmail.com',
      password: '93186145',
      role: Role.ADMIN,
    },
  ];


  let account = await prisma.account.findUnique({
    where: { email: accountEmail },
  });

  if (!account) {
    account = await prisma.account.create({
      data: {
        name: accountName,
        email: accountEmail,
      },
    });
    console.log(`Created account: ${account.name}`);
  } else {
    console.log(`Account already exists: ${account.name}`);
  }


  for (const item of list) {
    const { name, email, password, role } = item;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`User already exists: ${email}. Checking association...`);

      if (existingUser.accountId !== account.id) {
          await prisma.user.update({
              where: { id: existingUser.id },
              data: { accountId: account.id }
          });
          console.log(`Linked existing user ${email} to account ${account.name}`);
      }
      continue;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role,
        accountId: account.id,
      },
    });

    console.log(`Created user: ${user.email} linked to ${account.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
