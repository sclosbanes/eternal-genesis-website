'use client'
import { UserPlus, Eye, EyeOff, Shield, Users, Lock, Mail, Zap, Award, ArrowRight, Globe } from 'lucide-react'
import { useState } from 'react'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'

export default function Register() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setIsLoading(true)
  
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          confirmPassword,
          pin,
          confirmPin,
        }),
      })
    
      const data = await res.json()
    
      if (data.success) {
        await Swal.fire({
          title: 'Registration successful!',
          text: 'Please verify your email address to activate your account.',
          icon: 'success',
          confirmButtonText: 'Go to login',
          confirmButtonColor: '#f59e0b',
          background: '#1a1a1a',
          color: '#fff'
        })
        router.push('/login')
      } else {
        await Swal.fire({
          title: 'Registration failed',
          text: data.error,
          icon: 'error',
          confirmButtonText: 'Try again',
          confirmButtonColor: '#f59e0b',
          background: '#1a1a1a',
          color: '#fff'
        })
      }
    } catch (error) {
      await Swal.fire({
        title: 'Error',
        text: 'An error occurred. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#f59e0b',
        background: '#1a1a1a',
        color: '#fff'
      })
    } finally {
      setIsLoading(false)
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
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="flex justify-center order-2 lg:order-1">
            <div className="w-full max-w-md">
              <div className="bg-gray-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-white mb-0.5">Create account</h2>
                  <p className="text-sm text-gray-500">Join the adventure today</p>
                </div>

                  <form onSubmit={handleRegister} className="space-y-3">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                        Email address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors"
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Only Gmail, Outlook, Hotmail, and Live addresses are allowed</p>
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="********"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-12 py-2.5 text-white placeholder-gray-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors"
                          disabled={isLoading}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-400 transition-colors"
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-1">
                        Confirm password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Enter your password again"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-12 py-2.5 text-white placeholder-gray-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors"
                          disabled={isLoading}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-400 transition-colors"
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="pin" className="block text-sm font-medium text-gray-400 mb-1">
                        Security PIN
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          id="pin"
                          type={showPin ? 'number' : 'password'}
                          placeholder="4 to 6 digits"
                          value={pin}
                          onChange={(e) => setPin(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-12 py-2.5 text-white placeholder-gray-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors"
                          disabled={isLoading}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-400 transition-colors"
                          disabled={isLoading}
                        >
                          {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">The PIN must contain 4 to 6 digits</p>
                    </div>

                    <div>
                      <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-400 mb-1">
                        Confirm PIN
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          id="confirmPin"
                          type="password"
                          placeholder="Enter your PIN again"
                          value={confirmPin}
                          onChange={(e) => setConfirmPin(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors"
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-black bg-amber-500 border border-amber-400 hover:bg-amber-400 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          <span>Creating account...</span>
                        </>
                      ) : (
                        <>
                          <span>Create account</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>

                <div className="my-4 flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-700" />
                  <span className="text-xs text-gray-500">Already have an account?</span>
                  <div className="flex-1 h-px bg-gray-700" />
                </div>

                <a
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-medium text-amber-400 border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
                >
                  <Globe className="w-5 h-5" />
                  Log in instead
                </a>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-col justify-center space-y-6 order-1 lg:order-2">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-amber-500 flex items-center justify-center border border-amber-400/40 shadow-lg shadow-amber-500/20">
                <UserPlus className="w-7 h-7 text-black" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Join Eternal MMO : Genesis</h1>
                <p className="text-amber-400 text-sm mt-0.5">One account, one adventure in Madrigal</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Start your adventure in Madrigal. Create your account and join the Eternal MMO : Genesis community.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Shield, label: 'Stronger security', desc: 'Secure PIN and accounts' },
                { icon: Zap, label: 'Instant access', desc: 'Free to play' },
                { icon: Users, label: 'Active community', desc: 'Players from around the world' },
                { icon: Award, label: 'Premium rewards', desc: 'Items and bonuses' },
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
          </div>
        </div>
      </div>
    </div>
  )
}