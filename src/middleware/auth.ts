import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Specify Node.js runtime
export const runtime = 'nodejs';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function login(username: string, password: string, location?: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
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

    if (!user || !user.is_active) {
      return {
        success: false,
        error: 'Invalid credentials or user inactive'
      };
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return {
        success: false,
        error: 'Invalid credentials'
      };
    }

    // Create session log with location
    await prisma.activeLog.create({
      data: {
        user_id: user.id,
        session_id: Math.random().toString(36).substring(7),
        start_at: new Date(),
        ip_address: '127.0.0.1', // You should get this from the request
        location: location || 'Unknown' // Store the location
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        username: user.username,
        roles: user.roles.map(ur => ur.role.code)
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        roles: user.roles.map(ur => ({
          id: ur.role.id,
          name: ur.role.name_en,
          code: ur.role.code,
          permissions: ur.role.permission.map(rp => ({
            id: rp.permission.id,
            name: rp.permission.name_en,
            code: rp.permission.code
          }))
        }))
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'Internal server error'
    };
  }
}

export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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

    if (!user || !user.is_active) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
} 