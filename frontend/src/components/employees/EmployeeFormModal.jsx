import { useEffect, useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { createEmployee, updateEmployee } from '../../api/employees'

const ROLES = ['admin', 'manager', 'receptionist', 'housekeeper', 'staff']
const STATUS_OPTIONS = ['active', 'inactive', 'on_leave']

const emptyForm = {
  first_name: '',
  last_name: '',
  position: '',
  salary: '',
  hire_date: '',
  status: 'active',
  create_account: false,
  email: '',
  password: '',
  role: 'staff',
}

export default function EmployeeFormModal({ employee, onClose, onSuccess }) {
  const editMode = Boolean(employee)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (employee) {
      setForm({
        first_name: employee.first_name ?? '',
        last_name: employee.last_name ?? '',
        position: employee.position ?? '',
        salary: employee.salary ?? '',
        hire_date: employee.hire_date
          ? String(employee.hire_date).slice(0, 10)
          : '',
        status: employee.status ?? 'active',
        create_account: false,
        email: '',
        password: '',
        role: 'staff',
      })
    } else {
      setForm(emptyForm)
    }
    setErrors({})
  }, [employee])

  const change = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const fieldError = (name) => errors?.[name]?.[0]

  async function submit(e) {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})

    const payload = editMode
      ? {
          first_name: form.first_name,
          last_name: form.last_name,
          position: form.position,
          salary: form.salary,
          hire_date: form.hire_date,
          status: form.status,
        }
      : {
          first_name: form.first_name,
          last_name: form.last_name,
          position: form.position,
          salary: form.salary,
          hire_date: form.hire_date,
          create_account: form.create_account,
          ...(form.create_account
            ? {
                email: form.email,
                password: form.password,
                role: form.role,
              }
            : {}),
        }

    try {
      if (editMode) {
        await updateEmployee(employee.id, payload)
      } else {
        await createEmployee(payload)
      }

      onSuccess?.(editMode ? 'update' : 'create')
      onClose?.()
    } catch (err) {
      if (err?.status === 422 && err?.data?.errors) {
        setErrors(err.data.errors)
      } else {
        setErrors({ general: [err.message || 'Failed to save employee.'] })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-base-900 border border-base-border rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-base-border">
          <div>
            <h2 className="text-white font-serif text-xl font-bold">
              {editMode ? 'Edit Employee' : 'Add Employee'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {editMode
                ? 'Update employee information'
                : 'Create a new employee record'}
            </p>
          </div>
          <button onClick={onClose} disabled={submitting} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          {errors.general?.[0] && (
            <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
              {errors.general[0]}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name" name="first_name" value={form.first_name} onChange={change} error={fieldError('first_name')} required />
            <Field label="Last Name" name="last_name" value={form.last_name} onChange={change} error={fieldError('last_name')} required />
            <Field label="Position" name="position" value={form.position} onChange={change} error={fieldError('position')} required />
            <Field label="Salary" name="salary" type="number" min="0" step="0.01" value={form.salary} onChange={change} error={fieldError('salary')} required />
            <Field label="Hire Date" name="hire_date" type="date" value={form.hire_date} onChange={change} error={fieldError('hire_date')} required />

            {editMode && (
              <SelectField
                label="Status"
                name="status"
                value={form.status}
                onChange={change}
                options={STATUS_OPTIONS}
                error={fieldError('status')}
              />
            )}
          </div>

          {!editMode && (
            <div className="border-t border-base-border pt-5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="create_account"
                  checked={form.create_account}
                  onChange={change}
                  className="w-4 h-4 accent-amber-400"
                />
                <span>
                  <span className="block text-sm font-medium text-white">Create user account</span>
                  <span className="block text-xs text-slate-500 mt-0.5">
                    Give this employee login access to the system
                  </span>
                </span>
              </label>

              {form.create_account && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <Field label="Account Email" name="email" type="email" value={form.email} onChange={change} error={fieldError('email')} required />
                  <Field label="Password" name="password" type="password" value={form.password} onChange={change} error={fieldError('password')} required />

                  <SelectField
                    label="Role"
                    name="role"
                    value={form.role}
                    onChange={change}
                    options={ROLES}
                    error={fieldError('role')}
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-lg bg-base-800 border border-base-border text-slate-300 text-sm font-medium hover:bg-base-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-base-950 text-sm font-semibold disabled:opacity-50"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? 'Saving...' : editMode ? 'Update Employee' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, name, value, onChange, type = 'text', error, required = false, min, step }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">
        {label}{required && <span className="text-rose-400"> *</span>}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        step={step}
        className="w-full bg-base-800 border border-base-border rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
      />
      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
    </div>
  )
}

function SelectField({ label, name, value, onChange, options, error }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-base-800 border border-base-border rounded-lg px-3.5 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
    </div>
  )
}
