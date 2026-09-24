import api from '../lib/api'

export const triggerDatabaseBackup = async () => {
  const response = await api.post('/api/admin/backup-now')

  return response.data
}