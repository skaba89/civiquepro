import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin@2026!', 12);

  const admin = await db.user.upsert({
    where: { email: 'admin@civiquepro.fr' },
    update: { role: 'admin', password: hashedPassword },
    create: {
      email: 'admin@civiquepro.fr',
      name: 'Administrateur CiviquePro',
      password: hashedPassword,
      role: 'admin',
      emailVerified: new Date(),
    },
  });

  console.log(`✅ Admin user: ${admin.email} (role: ${admin.role})`);

  // Create default veille config entries
  const configs = [
    { key: 'last_cron_run', value: '', description: 'Dernière exécution cron' },
    { key: 'last_search', value: '', description: 'Dernière recherche veille IA' },
    { key: 'last_government_update', value: '', description: 'Dernière màj gouvernement' },
  ];

  for (const config of configs) {
    await db.veilleConfig.upsert({
      where: { key: config.key },
      update: { description: config.description },
      create: config,
    });
  }

  console.log('✅ Veille config seeded');
  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
