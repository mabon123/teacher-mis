import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Get all available permissions
  const allPermissions = await prisma.permission.findMany({
    where: {
      is_active: true
    }
  });

  // Define the permissions you want to assign
  const desiredPermissions = [
    // Location Management
    'LOCATION_VIEW',
    'LOCATION_CREATE',
    'LOCATION_UPDATE',
    'LOCATION_DELETE',
    // User Management (View only)
    'USER_VIEW',
    // Log Management (View only)
    'LOG_VIEW'
  ];

  // Filter permissions based on desired codes
  const selectedPermissions = allPermissions.filter(p => 
    desiredPermissions.includes(p.code)
  );

  // Create a new role with specific permissions
  const newRole = await prisma.role.create({
    data: {
      name_en: 'Location Manager',
      name_kh: 'អ្នកគ្រប់គ្រងទីតាំង',
      code: 'LOCATION_MANAGER',
      is_active: true,
      description: 'Can manage locations and view users and logs',
      permission: {
        create: selectedPermissions.map(permission => ({
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

  // Create new user with the role
  const hashedPassword = await bcrypt.hash('location123', 10);
  const newUser = await prisma.user.create({
    data: {
      username: 'location_manager',
      password: hashedPassword,
      is_active: true,
      roles: {
        create: {
          role_id: newRole.id
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

  console.log('New user created with role:', {
    user: {
      id: newUser.id,
      username: newUser.username,
      password: 'location123' // Only shown for initial setup
    },
    role: {
      name: newRole.name_en,
      code: newRole.code,
      permissions: newRole.permission.map(p => p.permission.code)
    }
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