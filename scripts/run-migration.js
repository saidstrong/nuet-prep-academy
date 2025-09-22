const { PrismaClient } = require('@prisma/client');

async function runMigration() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Running migration: Add isRead column to messages table...');
    
    // Add isRead column to messages table
    await prisma.$executeRaw`
      ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "isRead" BOOLEAN NOT NULL DEFAULT false;
    `;
    
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
