'use client'

import { useState } from 'react'
import { LogIn, Eye, EyeOff, Mail, Lock, Zap, Users, Target, Award, TrendingUp, ArrowRight, UserPlus } from 'lucide-react'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      })

      const data = await res.json()

      if (data.success) {
        const meRes = await fetch('/api/me', { credentials: 'include' })
        const meData = await meRes.json()

        await Swal.fire({
          icon: 'success',
          title: 'Login successful',
          text: `Welcome back, ${data.user.email}`,
          timer: 1500,
          showConfirmButton: false,
          confirmButtonColor: '#f59e0b',
        }).then(() => {
          if (meData.role === 'super') {
            window.location.href = '/admin'
          } else {
            window.location.href = '/profile'
          }
        })
        router.push('/profile')
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login failed',
          text: data.error || 'Invalid credentials',
          confirmButtonColor: '#f59e0b',
        })
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Server error',
        text: err.message || 'An error occurred',
        confirmButtonColor: '#f59e0b',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <img
        src="/bg.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      <div className="absolute inset-0 bg-black/70 z-[1]" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="flex justify-center order-2 lg:order-1">
            <div className="w-full max-w-md">
              <div className="bg-gray-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-xl">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
                  <p className="text-sm text-gray-500">Log in to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-400">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => router.push('/forgot-password')}
                        className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        Password oublie ?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-400 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg font-semibold text-black bg-amber-500 border border-amber-400 hover:bg-amber-400 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        <span>Log in en cours...</span>
                      </>
                    ) : (
                      <>
                        <span>Log in</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="my-6 flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-700" />
                  <span className="text-xs text-gray-500">New to Eternal MMO : Genesis?</span>
                  <div className="flex-1 h-px bg-gray-700" />
                </div>

                <a
                  href="/register"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-medium text-amber-400 border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
                >
                  <UserPlus className="w-5 h-5" />
                  Create account
                </a>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-col justify-center space-y-6 order-1 lg:order-2">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-amber-500 flex items-center justify-center border border-amber-400/40 shadow-lg shadow-amber-500/20">
                <LogIn className="w-7 h-7 text-black" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Eternal MMO : Genesis</h1>
                <p className="text-amber-400 text-sm mt-0.5">Your account, your progress</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Return to Madrigal. PvP, dungeons, and an active community are waiting for you.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Zap, label: 'Custom content', desc: 'Dungeons and events' },
                { icon: Users, label: 'Active community', desc: 'Players from around the world' },
                { icon: Target, label: 'Balanced PvP', desc: 'Fair fights' },
                { icon: Award, label: 'Rewards', desc: 'Items and bonuses' },
              ].map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="p-3 rounded-lg bg-gray-900 border border-gray-700 hover:border-amber-500/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-2">
                    <Icon className="w-4 h-4 text-amber-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">{label}</h3>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-gray-900 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-semibold text-white">Server online</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-lg font-bold text-amber-400">500+</span>
                  <p className="text-xs text-gray-500">Players</p>
                </div>
                <div>
                  <span className="text-lg font-bold text-amber-400">24/7</span>
                  <p className="text-xs text-gray-500">Availability</p>
                </div>
                <div>
                  <span className="text-lg font-bold text-amber-400">99.9%</span>
                  <p className="text-xs text-gray-500">Stability</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}