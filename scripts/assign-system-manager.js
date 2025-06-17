import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get the System Manager role
  const systemManagerRole = await prisma.role.findFirst({
    where: {
      code: 'SYS_MANAGER'
    }
  });

  if (!systemManagerRole) {
    console.error('System Manager role not found');
    process.exit(1);
  }

  // Update the user with the System Manager role
  const updatedUser = await prisma.user.update({
    where: {
      username: 'mabb' // Replace with your username
    },
    data: {
      roles: {
        deleteMany: {}, // Remove existing roles
        create: {
          role_id: systemManagerRole.id
        }
      }
    },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permission: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      }
    }
  });

  console.log('User updated with System Manager role:', {
    id: updatedUser.id,
    username: updatedUser.username,
    roles: updatedUser.roles.map(ur => ({
      name: ur.role.name_en,
      code: ur.role.code,
      permissions: ur.role.permission.map(rp => rp.permission.code)
    }))
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