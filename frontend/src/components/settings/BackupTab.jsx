import { useState } from 'react'
import {
  DatabaseBackup,
  Send,
  ShieldCheck,
  Clock3,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { triggerDatabaseBackup } from '../../services/backupService'

export default function BackupTab() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleCreateBackup = async () => {
    if (loading) return

    setLoading(true)
    setSuccess('')
    setError('')

    try {
      const data = await triggerDatabaseBackup()

      if (data?.status === 'success') {
        setSuccess(
          data.message ||
            'Database backup successfully created and uploaded to Telegram!'
        )
      } else {
        setError(
          data?.message ||
            'Backup process failed. Please check your Laravel logs.'
        )
      }
    } catch (err) {
      console.error('Backup error:', err)

      const message =
        err?.response?.data?.message ||
        'Unable to create the database backup. Please try again.'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Backup Card */}
      <div className="rounded-2xl border border-slate-700/80 bg-slate-800/60 p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-400/15">
            <DatabaseBackup className="h-6 w-6 text-amber-400" />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              Database Backup
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              Create a full backup of the hotel database and securely
              upload it to Telegram.
            </p>
          </div>
        </div>

        {/* Backup Information */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Backup Type */}
          <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
            <div className="flex items-center gap-3">
              <DatabaseBackup className="h-5 w-5 text-slate-400" />

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Backup Type
                </p>

                <p className="mt-1 text-sm font-medium text-white">
                  Full Database Backup
                </p>
              </div>
            </div>
          </div>

          {/* Destination */}
          <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
            <div className="flex items-center gap-3">
              <Send className="h-5 w-5 text-slate-400" />

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Destination
                </p>

                <p className="mt-1 text-sm font-medium text-white">
                  Telegram
                </p>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-slate-400" />

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Backup Status
                </p>

                <p className="mt-1 text-sm font-medium text-emerald-400">
                  Ready
                </p>
              </div>
            </div>
          </div>

          {/* Last Backup */}
          <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-slate-400" />

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Last Backup
                </p>

                <p className="mt-1 text-sm font-medium text-white">
                  Not available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success */}
        {success && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />

            <div>
              <p className="font-medium text-emerald-400">
                Backup completed
              </p>

              <p className="mt-1 text-sm leading-5 text-emerald-300/80">
                {success}
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

            <div>
              <p className="font-medium text-red-400">
                Backup failed
              </p>

              <p className="mt-1 text-sm leading-5 text-red-300/80">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Create Backup Button */}
        <button
          type="button"
          onClick={handleCreateBackup}
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating Backup...
            </>
          ) : (
            <>
              <DatabaseBackup className="h-5 w-5" />
              Create Backup Now
            </>
          )}
        </button>
      </div>

      {/* Information */}
      <div className="rounded-xl border border-slate-700/70 bg-slate-900/30 p-4">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />

          <div>
            <p className="text-sm font-medium text-slate-300">
              How backup works
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              When you create a backup, the system generates a complete
              database backup and uploads it to the configured Telegram
              destination. The backup process may take a few moments for
              larger databases.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}