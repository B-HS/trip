import { ADMIN_ROLE } from '@/shared/constant/auth'

export const isAdminRole = (role: string | null | undefined) => role === ADMIN_ROLE
