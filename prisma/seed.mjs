import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Generate unique timestamp for usernames
  const timestamp = Date.now();

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
    { code: 'STAFF_VIEW', name_en: 'View Staff', name_kh: 'មើលបុគ្គលិក', is_active: true },
    { code: 'STAFF_CREATE', name_en: 'Create Staff', name_kh: 'បង្កើតបុគ្គលិក', is_active: true },
    { code: 'STAFF_UPDATE', name_en: 'Update Staff', name_kh: 'កែប្រែបុគ្គលិក', is_active: true },
    { code: 'STAFF_DELETE', name_en: 'Delete Staff', name_kh: 'លុបបុគ្គលិក', is_active: true },
  ];

  // Create all permissions
  const createdPermissions = await Promise.all(
    permissions.map(permission =>
      prisma.permission.create({
        data: permission
      })
    )
  );

  // Create system admin role
  const systemAdminRole = await prisma.role.create({
    data: {
      name_en: 'System Administrator',
      name_kh: 'អ្នកគ្រប់គ្រងប្រព័ន្ធ',
      code: 'SYSTEM_ADMIN',
      is_active: true,
      description: 'System administrator with full access',
      permission: {
        create: createdPermissions.map(permission => ({
          permission_id: permission.id
        }))
      }
    }
  });

  // Create system admin user
  const systemAdmin = await prisma.user.create({
    data: {
      username: `system_admin_${timestamp}`,
      password: await bcrypt.hash('admin123', 10),
      is_active: true,
      roles: {
        create: {
          role: {
            connect: { id: systemAdminRole.id }
          }
        }
      }
    }
  });

  // Create roles for different levels
  const provinceRole = await prisma.role.create({
    data: {
      name_en: 'Province Manager',
      name_kh: 'អ្នកគ្រប់គ្រងខេត្ត',
      code: 'PROVINCE_MANAGER',
      is_active: true,
      description: 'Can manage all levels',
      permission: {
        create: createdPermissions.map(permission => ({
          permission_id: permission.id
        }))
      }
    }
  });

  const districtRole = await prisma.role.create({
    data: {
      name_en: 'District Manager',
      name_kh: 'អ្នកគ្រប់គ្រងស្រុក',
      code: 'DISTRICT_MANAGER',
      is_active: true,
      description: 'Can manage district and below',
      permission: {
        create: createdPermissions
          .filter(p => !p.code.includes('PROVINCE'))
          .map(permission => ({
            permission_id: permission.id
          }))
      }
    }
  });

  const communeRole = await prisma.role.create({
    data: {
      name_en: 'Commune Manager',
      name_kh: 'អ្នកគ្រប់គ្រងឃុំ',
      code: 'COMMUNE_MANAGER',
      is_active: true,
      description: 'Can manage commune and below',
      permission: {
        create: createdPermissions
          .filter(p => !p.code.includes('PROVINCE') && !p.code.includes('DISTRICT'))
          .map(permission => ({
            permission_id: permission.id
          }))
      }
    }
  });

  const villageRole = await prisma.role.create({
    data: {
      name_en: 'Village Manager',
      name_kh: 'អ្នកគ្រប់គ្រងភូមិ',
      code: 'VILLAGE_MANAGER',
      is_active: true,
      description: 'Can manage only village',
      permission: {
        create: createdPermissions
          .filter(p => !p.code.includes('PROVINCE') && !p.code.includes('DISTRICT') && !p.code.includes('COMMUNE'))
          .map(permission => ({
            permission_id: permission.id
          }))
      }
    }
  });

  // Create locations hierarchy
  const province = await prisma.province.create({
    data: {
      name_en: 'Phnom Penh',
      name_kh: 'ភ្នំពេញ',
      code: 'PP',
      is_active: true,
      creator: {
        connect: { id: systemAdmin.id }
      },
      updater: {
        connect: { id: systemAdmin.id }
      }
    }
  });

  const district = await prisma.district.create({
    data: {
      name_en: 'Chamkar Mon',
      name_kh: 'ចំការមន',
      code: 'CM',
      is_active: true,
      province: {
        connect: { id: province.id }
      },
      creator: {
        connect: { id: systemAdmin.id }
      },
      updater: {
        connect: { id: systemAdmin.id }
      }
    }
  });

  const commune = await prisma.commune.create({
    data: {
      name_en: 'Toul Svay Prey',
      name_kh: 'ទួលស្វាយព្រៃ',
      code: 'TSP',
      is_active: true,
      district: {
        connect: { id: district.id }
      },
      creator: {
        connect: { id: systemAdmin.id }
      },
      updater: {
        connect: { id: systemAdmin.id }
      }
    }
  });

  const village = await prisma.village.create({
    data: {
      name_en: 'Phum 1',
      name_kh: 'ភូមិ ១',
      code: 'P1',
      is_active: true,
      commune: {
        connect: { id: commune.id }
      },
      creator: {
        connect: { id: systemAdmin.id }
      },
      updater: {
        connect: { id: systemAdmin.id }
      }
    }
  });

  // Create organizations for each level
  const provinceOrg = await prisma.organization.create({
    data: {
      name_en: 'Phnom Penh Education Department',
      name_kh: 'នាយកដ្ឋានអប់រំភ្នំពេញ',
      code: 'PP-ED',
      is_active: true,
      type: 'PROVINCE',
      province: {
        connect: { id: province.id }
      },
      district: {
        connect: { id: district.id }
      },
      commune: {
        connect: { id: commune.id }
      },
      village: {
        connect: { id: village.id }
      },
      creator: {
        connect: { id: systemAdmin.id }
      },
      updater: {
        connect: { id: systemAdmin.id }
      }
    }
  });

  const districtOrg = await prisma.organization.create({
    data: {
      name_en: 'Chamkar Mon Education Office',
      name_kh: 'ការិយាល័យអប់រំចំការមន',
      code: 'CM-EO',
      is_active: true,
      type: 'DISTRICT',
      province: {
        connect: { id: province.id }
      },
      district: {
        connect: { id: district.id }
      },
      commune: {
        connect: { id: commune.id }
      },
      village: {
        connect: { id: village.id }
      },
      creator: {
        connect: { id: systemAdmin.id }
      },
      updater: {
        connect: { id: systemAdmin.id }
      }
    }
  });

  const schoolOrg = await prisma.organization.create({
    data: {
      name_en: 'Toul Svay Prey Education Center',
      name_kh: 'មជ្ឈមណ្ឌលអប់រំទួលស្វាយព្រៃ',
      code: 'TSP-EC',
      is_active: true,
      type: 'SCHOOL',
      province: {
        connect: { id: province.id }
      },
      district: {
        connect: { id: district.id }
      },
      commune: {
        connect: { id: commune.id }
      },
      village: {
        connect: { id: village.id }
      },
      creator: {
        connect: { id: systemAdmin.id }
      },
      updater: {
        connect: { id: systemAdmin.id }
      }
    }
  });

  // Create users for each level
  const provinceUser = await prisma.user.create({
    data: {
      username: `province_manager_${timestamp}`,
      password: await bcrypt.hash('province123', 10),
      is_active: true,
      roles: {
        create: {
          role: {
            connect: { id: provinceRole.id }
          }
        }
      },
      organization: {
        connect: { id: provinceOrg.id }
      }
    }
  });

  const districtUser = await prisma.user.create({
    data: {
      username: `district_manager_${timestamp}`,
      password: await bcrypt.hash('district123', 10),
      is_active: true,
      roles: {
        create: {
          role: {
            connect: { id: districtRole.id }
          }
        }
      },
      organization: {
        connect: { id: districtOrg.id }
      }
    }
  });

  const communeUser = await prisma.user.create({
    data: {
      username: `commune_manager_${timestamp}`,
      password: await bcrypt.hash('commune123', 10),
      is_active: true,
      roles: {
        create: {
          role: {
            connect: { id: communeRole.id }
          }
        }
      },
      organization: {
        connect: { id: schoolOrg.id }
      }
    }
  });

  const villageUser = await prisma.user.create({
    data: {
      username: `village_manager_${timestamp}`,
      password: await bcrypt.hash('village123', 10),
      is_active: true,
      roles: {
        create: {
          role: {
            connect: { id: villageRole.id }
          }
        }
      },
      organization: {
        connect: { id: schoolOrg.id }
      }
    }
  });

  console.log('Seed data created:', {
    systemAdmin,
    provinceUser,
    districtUser,
    communeUser,
    villageUser,
    organizations: {
      province: provinceOrg,
      district: districtOrg,
      school: schoolOrg
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