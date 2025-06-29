import { createSwaggerSpec } from 'next-swagger-doc';

const apiConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Teacher Management System API',
    version: '1.0.0',
    description: 'Comprehensive API for managing teachers, staff, locations, permissions, and academic data',
    contact: {
      name: 'API Support',
      email: 'support@teacherms.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3002/api',
      description: 'Development server'
    },
    {
      url: 'https://your-production-domain.com/api',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      // Authentication Schemas
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: {
            type: 'string',
            description: 'User username'
          },
          password: {
            type: 'string',
            description: 'User password'
          },
          location: {
            type: 'string',
            description: 'Location ID (optional)'
          }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean'
          },
          token: {
            type: 'string'
          },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              username: { type: 'string' },
              roles: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    role: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        permissions: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              name: { type: 'string' },
                              category: { type: 'string' }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message'
          }
        }
      },
      
      // User Schemas
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          username: { type: 'string' },
          is_active: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          roles: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/UserRole'
            }
          }
        }
      },
      UserRole: {
        type: 'object',
        properties: {
          role: {
            $ref: '#/components/schemas/Role'
          }
        }
      },
      CreateUserRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string' },
          password: { type: 'string' },
          roles: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of role IDs'
          }
        }
      },
      UpdateUserRequest: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
          username: { type: 'string' },
          password: { type: 'string' },
          is_active: { type: 'boolean' },
          roles: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      },

      // Role Schemas
      Role: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          permissions: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/RolePermission'
            }
          }
        }
      },
      RolePermission: {
        type: 'object',
        properties: {
          permission: {
            $ref: '#/components/schemas/Permission'
          }
        }
      },
      CreateRoleRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          permissions: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      },
      UpdateRoleRequest: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          permissions: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      },

      // Permission Schemas
      Permission: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      PermissionGroup: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          permissions: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/GroupPermission'
            }
          }
        }
      },
      GroupPermission: {
        type: 'object',
        properties: {
          permission: {
            $ref: '#/components/schemas/Permission'
          }
        }
      },
      CreatePermissionRequest: {
        type: 'object',
        required: ['name', 'category'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' }
        }
      },
      CreatePermissionGroupRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          permissions: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      },

      // Location Schemas
      Location: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string' },
          parent_id: { type: 'string', nullable: true },
          level: { type: 'number' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          children: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Location'
            }
          }
        }
      },
      CreateLocationRequest: {
        type: 'object',
        required: ['name', 'type'],
        properties: {
          name: { type: 'string' },
          type: { type: 'string' },
          parent_id: { type: 'string' }
        }
      },
      UpdateLocationRequest: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string' },
          parent_id: { type: 'string' }
        }
      },

      // Staff Schemas
      Staff: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          employee_id: { type: 'string' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          date_of_birth: { type: 'string', format: 'date' },
          gender: { type: 'string' },
          address: { type: 'string' },
          hire_date: { type: 'string', format: 'date' },
          position: { type: 'string' },
          department: { type: 'string' },
          salary_level: { type: 'string' },
          location_id: { type: 'string' },
          is_active: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          location: {
            $ref: '#/components/schemas/Location'
          },
          history: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/StaffHistory'
            }
          }
        }
      },
      StaffHistory: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          staff_id: { type: 'string' },
          field_name: { type: 'string' },
          old_value: { type: 'string' },
          new_value: { type: 'string' },
          changed_at: { type: 'string', format: 'date-time' },
          changed_by: { type: 'string' }
        }
      },
      CreateStaffRequest: {
        type: 'object',
        required: ['employee_id', 'first_name', 'last_name', 'email', 'hire_date', 'position', 'department', 'location_id'],
        properties: {
          employee_id: { type: 'string' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          date_of_birth: { type: 'string', format: 'date' },
          gender: { type: 'string' },
          address: { type: 'string' },
          hire_date: { type: 'string', format: 'date' },
          position: { type: 'string' },
          department: { type: 'string' },
          salary_level: { type: 'string' },
          location_id: { type: 'string' }
        }
      },
      UpdateStaffRequest: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
          employee_id: { type: 'string' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          date_of_birth: { type: 'string', format: 'date' },
          gender: { type: 'string' },
          address: { type: 'string' },
          hire_date: { type: 'string', format: 'date' },
          position: { type: 'string' },
          department: { type: 'string' },
          salary_level: { type: 'string' },
          location_id: { type: 'string' },
          is_active: { type: 'boolean' }
        }
      },

      // Academic Schemas
      AcademicYear: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          start_date: { type: 'string', format: 'date' },
          end_date: { type: 'string', format: 'date' },
          is_active: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      Subject: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          code: { type: 'string' },
          description: { type: 'string' },
          credits: { type: 'number' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      Level: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },

      // Timetable Schemas
      TimetableEntry: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          staff_id: { type: 'string' },
          subject_id: { type: 'string' },
          level_id: { type: 'string' },
          day_of_week: { type: 'number' },
          start_time: { type: 'string' },
          end_time: { type: 'string' },
          room: { type: 'string' },
          academic_year_id: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          staff: {
            $ref: '#/components/schemas/Staff'
          },
          subject: {
            $ref: '#/components/schemas/Subject'
          },
          level: {
            $ref: '#/components/schemas/Level'
          },
          academic_year: {
            $ref: '#/components/schemas/AcademicYear'
          }
        }
      },

      // Audit Log Schemas
      AuditLog: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          user_id: { type: 'string' },
          action: { type: 'string' },
          entity_type: { type: 'string' },
          entity_id: { type: 'string' },
          details: { type: 'string' },
          ip_address: { type: 'string' },
          user_agent: { type: 'string' },
          success: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' }
        }
      },
      LocationLog: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          user_id: { type: 'string' },
          location_id: { type: 'string' },
          action: { type: 'string' },
          details: { type: 'string' },
          ip_address: { type: 'string' },
          user_agent: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' }
        }
      },
      ActiveLog: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          user_id: { type: 'string' },
          action: { type: 'string' },
          ip_address: { type: 'string' },
          user_agent: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' }
        }
      }
    }
  },
  security: [
    {
      BearerAuth: []
    }
  ]
};

export const getApiDocs = () => {
  return createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: apiConfig
  });
}; 