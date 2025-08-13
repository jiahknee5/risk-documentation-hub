import { UserRole } from '@/generated/prisma'
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      department?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    department?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    department?: string
  }
}