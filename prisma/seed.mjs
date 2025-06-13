import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create permissions
  const permissions = [
    { code: 'USER_VIEW', name_en: 'View Users', name_kh: 'មើលអ្នកប្រើប្រាស់', is_active: true },
    { code: 'USER_CREATE', name_en: 'Create Users', name_kh: 'បង្កើតអ្នកប្រើប្រាស់', is_active: true },
    { code: 'USER_UPDATE', name_en: 'Update Users', name_kh: 'កែប្រែអ្នកប្រើប្រាស់', is_active: true },
    { code: 'USER_DELETE', name_en: 'Delete Users', name_kh: 'លុបអ្នកប្រើប្រាស់', is_active: true },
    { code: 'ROLE_VIEW', name_en: 'View Roles', name_kh: 'មើលតួនាទី', is_active: true },
    { code: 'ROLE_CREATE', name_en: 'Create Roles', name_kh: 'បង្កើតតួនាទី', is_active: true },
    { code: 'ROLE_UPDATE', name_en: 'Update Roles', name_kh: 'កែប្រែតួនាទី', is_active: true },
    { code: 'ROLE_DELETE', name_en: 'Delete Roles', name_kh: 'លុបតួនាទី', is_active: true },
    { code: 'PERMISSION_VIEW', name_en: 'View Permissions', name_kh: 'មើលការអនុញ្ញាត', is_active: true },
    { code: 'PERMISSION_CREATE', name_en: 'Create Permissions', name_kh: 'បង្កើតការអនុញ្ញាត', is_active: true },
    { code: 'PERMISSION_UPDATE', name_en: 'Update Permissions', name_kh: 'កែប្រែការអនុញ្ញាត', is_active: true },
    { code: 'PERMISSION_DELETE', name_en: 'Delete Permissions', name_kh: 'លុបការអនុញ្ញាត', is_active: true },
    { code: 'LOCATION_VIEW', name_en: 'View Locations', name_kh: 'មើលទីតាំង', is_active: true },
    { code: 'LOCATION_CREATE', name_en: 'Create Locations', name_kh: 'បង្កើតទីតាំង', is_active: true },
    { code: 'LOCATION_UPDATE', name_en: 'Update Locations', name_kh: 'កែប្រែទីតាំង', is_active: true },
    { code: 'LOCATION_DELETE', name_en: 'Delete Locations', name_kh: 'លុបទីតាំង', is_active: true },
    { code: 'LOG_VIEW', name_en: 'View Logs', name_kh: 'មើលកំណត់ហេតុ', is_active: true },
    { code: 'LOG_UPDATE', name_en: 'Update Logs', name_kh: 'កែប្រែកំណត់ហេតុ', is_active: true },
  ];

  // Create all permissions
  const createdPermissions = await Promise.all(
    permissions.map(permission =>
      prisma.permission.create({
        data: permission
      })
    )
  );

  // Create admin role
  const adminRole = await prisma.role.create({
    data: {
      name_en: 'Administrator',
      name_kh: 'អ្នកគ្រប់គ្រង',
      code: 'ADMIN',
      is_active: true,
      description: 'System administrator with full access',
      permission: {
        create: createdPermissions.map(permission => ({
          permission_id: permission.id
        }))
      }
    }
  });

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      is_active: true,
      roles: {
        create: {
          role_id: adminRole.id
        }
      }
    }
  });

  console.log('Seed data created:', { adminUser, adminRole, permissions: createdPermissions });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 