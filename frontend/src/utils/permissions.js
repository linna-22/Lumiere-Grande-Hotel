/**
 * Get the rank of a user role.
 */
export const getUserRank = (role) => {
  switch (role) {
    case 'super_admin':
    case 'owner':
      return 3

    case 'admin':
    case 'manager':
      return 2

    default:
      return 1
  }
}

/**
 * Check whether the current user can manage another user.
 *
 * Rules:
 * - User must exist.
 * - Target user must exist.
 * - User cannot manage/delete themselves.
 * - Current user's rank must be strictly higher.
 */
export const canManageUser = (
  currentUser,
  targetUser
) => {
  if (!currentUser || !targetUser) {
    return false
  }

  // Never allow self-management/deletion.
  if (
    Number(currentUser.id) ===
    Number(targetUser.id)
  ) {
    return false
  }

  // Strictly higher rank is required.
  return (
    getUserRank(currentUser.role) >
    getUserRank(targetUser.role)
  )
}

/**
 * Delete permission follows the same rank rules.
 */
export const canDeleteUser = canManageUser

/**
 * Check whether a user can see a specific Sidebar item.
 *
 * Rank 3:
 *   Full system access.
 *
 * Rank 2:
 *   Hotel/user operations, but NO Settings.
 *
 * Rank 1:
 *   Front-desk/operational pages only.
 *   NO Users, Employees, Settings, etc.
 */
export const canViewSidebarItem = (
  role,
  label
) => {
  const rank = getUserRank(role)

  // ==========================================================
  // RANK 3
  // Super Admin / Owner
  // ==========================================================

  if (rank >= 3) {
    return true
  }

  // ==========================================================
  // RANK 2
  // Admin / Manager
  // ==========================================================

  if (rank === 2) {
    // Admin and Manager do NOT see Settings.
    if (label === 'Settings') {
      return false
    }

    return true
  }

  // ==========================================================
  // RANK 1
  // Receptionist / Housekeeper / Staff
  // ==========================================================

  const rankOneAllowed = new Set([
    'Dashboard',
    'Rooms',
    'Reservations',
    'Guests',
    'Invoices',
    'Check In',
    'Check Out',
  ])

  return rankOneAllowed.has(label)
}

/**
 * Convenience helper specifically for Settings.
 *
 * Settings is available only to:
 * - Super Admin
 * - Owner
 *
 * It is hidden from:
 * - Admin
 * - Manager
 * - Receptionist
 * - Housekeeper
 * - Staff
 */
export const canViewSettings = (role) => {
  return (
    role === 'super_admin' ||
    role === 'owner'
  )
}