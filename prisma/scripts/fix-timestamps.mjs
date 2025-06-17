import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fixTimestamps() {
  try {
    // Update users with null created_at
    const updateCreatedAt = await prisma.user.updateMany({
      where: {
        created_at: null
      },
      data: {
        created_at: new Date()
      }
    });

    // Update users with null updated_at
    const updateUpdatedAt = await prisma.user.updateMany({
      where: {
        updated_at: null
      },
      data: {
        updated_at: new Date()
      }
    });

    console.log('Updated users with null created_at:', updateCreatedAt.count);
    console.log('Updated users with null updated_at:', updateUpdatedAt.count);
  } catch (error) {
    console.error('Error fixing timestamps:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTimestamps(); 