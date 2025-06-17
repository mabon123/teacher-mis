const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create all necessary permissions
  const permissions = [
    // Location permissions
    { name_en: 'View Provinces', name_kh: 'មើលខេត្ត', code: 'location.province.view' },
    { name_en: 'Create Provinces', name_kh: 'បង្កើតខេត្ត', code: 'location.province.create' },
    { name_en: 'Update Provinces', name_kh: 'កែប្រែខេត្ត', code: 'location.province.update' },
    { name_en: 'Delete Provinces', name_kh: 'លុបខេត្ត', code: 'location.province.delete' },
    
    { name_en: 'View Districts', name_kh: 'មើលស្រុក', code: 'location.district.view' },
    { name_en: 'Create Districts', name_kh: 'បង្កើតស្រុក', code: 'location.district.create' },
    { name_en: 'Update Districts', name_kh: 'កែប្រែស្រុក', code: 'location.district.update' },
    { name_en: 'Delete Districts', name_kh: 'លុបស្រុក', code: 'location.district.delete' },
    
    { name_en: 'View Communes', name_kh: 'មើលឃុំ', code: 'location.commune.view' },
    { name_en: 'Create Communes', name_kh: 'បង្កើតឃុំ', code: 'location.commune.create' },
    { name_en: 'Update Communes', name_kh: 'កែប្រែឃុំ', code: 'location.commune.update' },
    { name_en: 'Delete Communes', name_kh: 'លុបឃុំ', code: 'location.commune.delete' },
    
    { name_en: 'View Villages', name_kh: 'មើលភូមិ', code: 'location.village.view' },
    { name_en: 'Create Villages', name_kh: 'បង្កើតភូមិ', code: 'location.village.create' },
    { name_en: 'Update Villages', name_kh: 'កែប្រែភូមិ', code: 'location.village.update' },
    { name_en: 'Delete Villages', name_kh: 'លុបភូមិ', code: 'location.village.delete' },
    
    // User management permissions
    { name_en: 'View Users', name_kh: 'មើលអ្នកប្រើប្រាស់', code: 'user.view' },
    { name_en: 'Create Users', name_kh: 'បង្កើតអ្នកប្រើប្រាស់', code: 'user.create' },
    { name_en: 'Update Users', name_kh: 'កែប្រែអ្នកប្រើប្រាស់', code: 'user.update' },
    { name_en: 'Delete Users', name_kh: 'លុបអ្នកប្រើប្រាស់', code: 'user.delete' },
    
    // Role management permissions
    { name_en: 'View Roles', name_kh: 'មើលតួនាទី', code: 'role.view' },
    { name_en: 'Create Roles', name_kh: 'បង្កើតតួនាទី', code: 'role.create' },
    { name_en: 'Update Roles', name_kh: 'កែប្រែតួនាទី', code: 'role.update' },
    { name_en: 'Delete Roles', name_kh: 'លុបតួនាទី', code: 'role.delete' },
    
    // Permission management permissions
    { name_en: 'View Permissions', name_kh: 'មើលការអនុញ្ញាត', code: 'permission.view' },
    { name_en: 'Create Permissions', name_kh: 'បង្កើតការអនុញ្ញាត', code: 'permission.create' },
    { name_en: 'Update Permissions', name_kh: 'កែប្រែការអនុញ្ញាត', code: 'permission.update' },
    { name_en: 'Delete Permissions', name_kh: 'លុបការអនុញ្ញាត', code: 'permission.delete' },
    
    // Log management permissions
    { name_en: 'View Active Logs', name_kh: 'មើលកំណត់ហេតុសកម្ម', code: 'LOG_VIEW' },
    { name_en: 'View Audit Logs', name_kh: 'មើលកំណត់ហេតុវិភាគ', code: 'LOG_VIEW' },
    { name_en: 'Update Logs', name_kh: 'កែប្រែកំណត់ហេតុ', code: 'LOG_UPDATE' },
    { name_en: 'View Location Logs', name_kh: 'មើលកំណត់ហេតុទីតាំង', code: 'location.logs.view' }
  ];

  // Create permissions
  const createdPermissions = await Promise.all(
    permissions.map(async (permission) => {
      return prisma.permission.create({
        data: {
          ...permission,
          is_active: true
        }
      });
    })
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
          permission: {
            connect: { id: permission.id }
          }
        }))
      }
    }
  });

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin001', 10);
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin001',
      password: hashedPassword,
      is_active: true,
      roles: {
        create: {
          role_id: adminRole.id
        }
      }
    }
  });

  console.log('Admin setup completed:', {
    user: {
      id: adminUser.id,
      username: adminUser.username
    },
    role: {
      id: adminRole.id,
      name: adminRole.name_en,
      code: adminRole.code
    },
    permissions: createdPermissions.length
  });
}

main()
  .catch((e) => {
    console.error('Error during admin setup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 