import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function Login({ onNavigate }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    // TODO: wire up to /api/login once the endpoint exists
    console.log('Login form submitted:', form)
  }

  return (
    <div className="min-h-screen flex bg-base-950">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop"
          alt="LUMIÈRE GRAND"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-base-950 via-base-950/60 to-black/30" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <h1 className="text-4xl font-serif font-bold text-white mb-2">LUMIÈRE GRAND</h1>
          <p className="text-slate-300 text-sm">Hotel Management System · Phnom Penh, Cambodia</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-slate-400 mt-1">Sign in to manage your hotel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full bg-base-850 border border-base-border rounded-lg pl-10 pr-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-base-850 border border-base-border rounded-lg pl-10 pr-10 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input type="checkbox" className="rounded border-base-border bg-base-850 accent-amber-400" />
                Remember me
              </label>
              <a href="#" className="text-amber-400 hover:text-amber-300 transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-400 hover:bg-amber-500 text-base-950 font-semibold py-2.5 rounded-lg transition-colors"
            >
              Sign In
            </button>
          </form>

          <p className="text-sm text-slate-400 text-center mt-6">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate?.('Register')}
              className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}