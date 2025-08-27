const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSupabase() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Supabase connected successfully');
    
    // Check if users table exists and has data
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in Supabase: ${userCount}`);
    
    // Check for the owner account specifically
    const owner = await prisma.user.findUnique({
      where: { email: 'owner@nuetprep.academy' }
    });
    
    if (owner) {
      console.log('✅ Owner account already exists in Supabase');
      console.log(`   ID: ${owner.id}`);
      console.log(`   Name: ${owner.name}`);
      console.log(`   Role: ${owner.role}`);
    } else {
      console.log('❌ Owner account NOT found - creating it now...');
      
      // Create owner account
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('owner123', 12);
      
      const newOwner = await prisma.user.create({
        data: {
          email: 'owner@nuetprep.academy',
          name: 'Said Amanzhol',
          password: hashedPassword,
          role: 'OWNER',
          profile: {
            create: {
              bio: 'Founder and owner of NUET Prep Academy',
              phone: '+77075214911',
              address: 'Astana, Kabanbay Batyr avenue, 53. Nazarbayev University',
            }
          }
        }
      });
      
      console.log('✅ Owner account created in Supabase:');
      console.log(`   ID: ${newOwner.id}`);
      console.log(`   Email: ${newOwner.email}`);
      console.log(`   Role: ${newOwner.role}`);
    }
    
    // Check courses
    const courseCount = await prisma.course.count();
    console.log(`📚 Total courses in Supabase: ${courseCount}`);
    
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSupabase();
