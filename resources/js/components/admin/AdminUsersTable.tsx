import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { MapPin } from 'lucide-react'
import { Link } from 'react-router'
import { formatDate, initialsOf } from '@/lib/format'
import type { AdminUser } from '@/types/api'
import { USER_STATUS_LABELS } from '@/lib/admin'

export function AdminUsersTable({ users }: { users: AdminUser[] }) {
  useLocale()
  return (
    <div className="admin-table-scroll">
      <table className="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{t('Name / Business')}</th>
            <th>{t('Type')}</th>
            <th>{t('Location')}</th>
            <th>{t('Status')}</th>
            <th>{t('Joined')}</th>
            <th>{t('Actions')}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>
                <div className="admin-user-cell">
                  {user.logo_url ? (
                    <img src={user.logo_url} alt="" />
                  ) : (
                    <span className="admin-avatar">{initialsOf(user.name)}</span>
                  )}
                  <span>
                    <strong>{user.name}</strong>
                    <small>
                      {user.service ??
                        (user.roles.includes('admin') ? t('Administrator') : (user.email ?? t('Account')))}
                    </small>
                  </span>
                </div>
              </td>
              <td>
                <span className={`admin-type admin-type-${user.type}`}>
                  {user.type === 'individual'
                    ? t('Individual')
                    : user.type === 'agency'
                      ? t('Business')
                      : t('Account')}
                </span>
              </td>
              <td>
                <span className="admin-location">
                  {user.locality ? (
                    <>
                      <MapPin size={12} aria-hidden />
                      {user.locality}
                    </>
                  ) : (
                    '—'
                  )}
                </span>
              </td>
              <td>
                <span className={`admin-status admin-status-${user.status}`}>
                  {t(USER_STATUS_LABELS[user.status])}
                </span>
              </td>
              <td className="admin-date">{formatDate(user.joined_at)}</td>
              <td>
                {user.provider_id ? (
                  <Link
                    className="admin-row-action"
                    to={`/admin/providers/${user.provider_id}`}
                    aria-label={t('Manage {name}', { name: user.name })}
                  >
                    {t('Manage')}
                  </Link>
                ) : (
                  <span className="admin-muted">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 ? <p className="admin-empty">{t('No users match this selection.')}</p> : null}
    </div>
  )
}
