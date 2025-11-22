import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      username: 'testuser',
      password: hashedPassword,
      bio: 'I am a test user',
      image: 'https://i.stack.imgur.com/xHWG8.jpg',
    },
  });

  console.log('Created user:', user.username);

  // Create some tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: 'reactjs' },
      update: {},
      create: { name: 'reactjs' },
    }),
    prisma.tag.upsert({
      where: { name: 'angularjs' },
      update: {},
      create: { name: 'angularjs' },
    }),
    prisma.tag.upsert({
      where: { name: 'dragons' },
      update: {},
      create: { name: 'dragons' },
    }),
  ]);

  console.log('Created tags:', tags.map((t) => t.name));

  // Create a sample article
  const article = await prisma.article.upsert({
    where: { slug: 'how-to-train-your-dragon' },
    update: {},
    create: {
      slug: 'how-to-train-your-dragon',
      title: 'How to train your dragon',
      description: 'Ever wonder how?',
      body: 'You have to believe',
      authorId: user.id,
      tags: {
        create: tags.map((tag) => ({
          tagId: tag.id,
        })),
      },
    },
  });

  console.log('Created article:', article.title);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

