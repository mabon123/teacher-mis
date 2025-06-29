import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  // Create Location Types first
  const nationalLocationType = await prisma.locationType.create({
    data: {
      code: "NATIONAL",
      name_en: "National",
      name_kh: "ជាតិ",
      order: 1
    }
  });

  const provinceLocationType = await prisma.locationType.create({
    data: {
      code: "PROVINCE",
      name_en: "Province",
      name_kh: "ខេត្ត",
      order: 2
    }
  });

  // Create Level Types
  const nationalLevel = await prisma.levelType.create({
    data: {
      name_en: "National Level",
      name_kh: "ថ្នាក់ជាតិ",
      code: "NATIONAL",
      level_order: 1,
      is_active: true,
      created_by: "system",
      updated_by: "system"
    }
  });

  const provinceLevel = await prisma.levelType.create({
    data: {
      name_en: "Province Level",
      name_kh: "ថ្នាក់ខេត្ត",
      code: "PROVINCE",
      level_order: 2,
      is_active: true,
      can_manage_levels_ids: [nationalLevel.id],
      created_by: "system",
      updated_by: "system"
    }
  });

  const districtLevel = await prisma.levelType.create({
    data: {
      name_en: "District Level",
      name_kh: "ថ្នាក់ស្រុក",
      code: "DISTRICT",
      level_order: 3,
      is_active: true,
      can_manage_levels_ids: [nationalLevel.id, provinceLevel.id],
      created_by: "system",
      updated_by: "system"
    }
  });

  await prisma.levelType.create({
    data: {
      name_en: "School Level",
      name_kh: "ថ្នាក់សាលា",
      code: "SCHOOL",
      level_order: 4,
      is_active: true,
      can_manage_levels_ids: [nationalLevel.id, provinceLevel.id, districtLevel.id],
      created_by: "system",
      updated_by: "system"
    }
  });

  // Create Organizations
  const moe = await prisma.organization.create({
    data: {
      name_en: "Ministry of Education",
      name_kh: "ក្រសួងអប់រំ",
      code: "MOE",
      is_active: true,
      location_type_id: nationalLocationType.id,
      province_id: "phnom_penh_id",
      district_id: "central_id",
      created_by: "system",
      updated_by: "system"
    }
  });

  const pped = await prisma.organization.create({
    data: {
      name_en: "Phnom Penh Education Department",
      name_kh: "នាយកដ្ឋានអប់រំភ្នំពេញ",
      code: "PPED",
      is_active: true,
      location_type_id: provinceLocationType.id,
      province_id: "phnom_penh_id",
      district_id: "central_id",
      created_by: "system",
      updated_by: "system"
    }
  });

  // Create User Levels
  const nationalAdminLevel = await prisma.userLevel.create({
    data: {
      name: "National Administrator",
      description: "Administrator at national level",
      level_type_id: nationalLevel.id,
      organization_id: moe.id,
      created_by: "system",
      updated_by: "system"
    }
  });

  const provinceAdminLevel = await prisma.userLevel.create({
    data: {
      name: "Province Administrator",
      description: "Administrator at province level",
      level_type_id: provinceLevel.id,
      organization_id: pped.id,
      created_by: "system",
      updated_by: "system"
    }
  });

  // Create Users
  const nationalAdmin = await prisma.user.create({
    data: {
      username: "national_admin",
      password: await hashPassword("admin123"),
      is_active: true,
      user_level_id: nationalAdminLevel.id,
      organization_id: moe.id
    }
  });

  const provinceAdmin = await prisma.user.create({
    data: {
      username: "province_admin",
      password: await hashPassword("admin123"),
      is_active: true,
      user_level_id: provinceAdminLevel.id,
      organization_id: pped.id
    }
  });

  console.log('Seed data created successfully');
  console.log('Created admin users:', {
    national: nationalAdmin.username,
    province: provinceAdmin.username
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