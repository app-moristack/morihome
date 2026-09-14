import type { AdminUserStatus } from '@/types/api'

export const USER_STATUS_LABELS: Record<AdminUserStatus, string> = {
  active: 'Active',
  pending: 'Pending verification',
  suspended: 'Suspended',
  inactive: 'Inactive',
}
