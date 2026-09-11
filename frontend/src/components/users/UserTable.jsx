import {
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react'

export default function UserTable({
  users,
  loading,
  onView,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="px-6 py-12 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-slate-400">
          <div className="w-4 h-4 border-2 border-slate-600 border-t-amber-400 rounded-full animate-spin" />
          Loading users...
        </div>
      </div>
    )
  }

  if (!users.length) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-sm text-slate-400">
          No users found.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-base-border">
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            Name
            </th>

            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Email
            </th>

            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Role
            </th>

            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Created-at
            </th>

            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-base-border">
          {users.map((user) => (
            <tr
              key={user.id}
              className="hover:bg-base-800/50 transition-colors"
            >
              {/* User */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-400/15 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-amber-400">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.name || '—'}
                    </p>

                    {/* <p className="text-xs text-slate-500">
                      ID #{user.id}
                    </p> */}
                  </div>
                </div>
              </td>

              {/* Email */}
              <td className="px-6 py-4">
                <span className="text-sm text-slate-300">
                  {user.email || '—'}
                </span>
              </td>

              {/* Role */}
              <td className="px-6 py-4">
                <RoleBadge role={user.role} />
              </td>

              {/* Joined */}
              <td className="px-6 py-4">
                <span className="text-sm text-slate-400">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : '—'}
                </span>
              </td>

              {/* Actions */}
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onView?.(user.id)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-base-800 border border-base-border text-xs font-medium text-slate-300 hover:bg-base-700 hover:text-white transition-colors"
                  >
                    <Eye size={13} />
                    View
                  </button>

                  <button
                    type="button"
                    onClick={() => onEdit?.(user.id)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-base-800 border border-base-border text-xs font-medium text-slate-300 hover:bg-base-700 hover:text-white transition-colors"
                  >
                    <Pencil size={13} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete?.(user)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-base-800 border border-base-border text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RoleBadge({ role }) {
  const labels = {
    admin: 'Admin',
    super_admin: 'Super Admin',
    manager: 'Manager',
    cashier: 'Cashier',
    receptionist: 'Receptionist',
    customer: 'Customer',
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-base-800 border border-base-border text-slate-300">
      {labels[role] || role || '—'}
    </span>
  )
}