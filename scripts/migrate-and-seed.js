const { execSync } = require('child_process');

async function migrateAndSeed() {
  try {
    console.log('🚀 Starting database migration and seeding...');
    
    // Run Prisma migrations
    console.log('📊 Running Prisma migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    // Seed the database
    console.log('🌱 Seeding database...');
    execSync('npm run db:seed', { stdio: 'inherit' });
    
    console.log('✅ Database migration and seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during migration/seeding:', error);
    process.exit(1);
  }
}

migrateAndSeed();
