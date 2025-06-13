import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get all permissions
  const permissions = await prisma.permission.findMany({
    where: {
      is_active: true
    }
  });

  // Create system manager role
  const systemManagerRole = await prisma.role.create({
    data: {
      name_en: 'System Manager',
      name_kh: 'អ្នកគ្រប់គ្រងប្រព័ន្ធ',
      code: 'SYS_MANAGER',
      is_active: true,
      description: 'Full system access with all permissions',
      permission: {
        create: permissions.map(permission => ({
          permission: {
            connect: { id: permission.id }
          }
        }))
      }
    },
    include: {
      permission: {
        include: {
          permission: true
        }
      }
    }
  });

  console.log('System Manager role created:', {
    id: systemManagerRole.id,
    name: systemManagerRole.name_en,
    code: systemManagerRole.code,
    permissions: systemManagerRole.permission.map(p => p.permission.code)
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 