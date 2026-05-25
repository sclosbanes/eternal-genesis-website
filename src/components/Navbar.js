'use client'

import React from 'react'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Download,
  BarChart2,
  Store,
  Trophy,
  Menu,
  X,
  LogIn,
  UserPlus,
  LogOut,
  User,
  Settings,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [isSuperUser, setIsSuperUser] = useState(false)
  const [showAdminDropdown, setShowAdminDropdown] = useState(false)
  const dropdownRef = useRef(null)

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Download', href: '/download', icon: Download },
    { label: 'Rankings', href: '/ranking', icon: BarChart2 },
    { label: 'Shops', href: '/shops', icon: Store },
    { label: 'Top PayPal', href: '/paypal-ranking', icon: Trophy },
  ]

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24)
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowAdminDropdown(false)
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/me', { method: 'GET', credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setIsLoggedIn(true)
          setUsername(data.email || 'Guest')
          setIsSuperUser(data.role?.toLowerCase() === 'super')
        } else {
          setIsLoggedIn(false)
        }
      } catch (err) {
        console.error('[AUTH ERROR]', err)
        setIsLoggedIn(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'GET', credentials: 'include' })
    window.location.href = '/'
  }

  const isActive = (href) => pathname === href || (href !== '/' && pathname?.startsWith(href))

  return (
    <nav className="fixed top-0 z-[100] w-full px-3 pt-3 sm:px-5">
      <div
        className={`relative mx-auto max-w-7xl overflow-visible rounded-2xl border transition-all duration-300 ${
          scrolled
            ? 'border-amber-400/25 bg-[#07090f]/92 shadow-[0_14px_46px_rgba(0,0,0,0.55),0_0_24px_rgba(0,212,255,0.10)]'
            : 'border-white/10 bg-[#07090f]/68 shadow-[0_10px_36px_rgba(0,0,0,0.34)]'
        } backdrop-blur-xl`}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden>
          <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center opacity-[0.10]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(0,212,255,0.20),transparent_32%),radial-gradient(circle_at_84%_24%,rgba(245,158,11,0.18),transparent_28%),linear-gradient(90deg,rgba(255,255,255,0.08),transparent_18%,transparent_82%,rgba(255,255,255,0.07))]" />
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/70 to-transparent" />
          <div className="absolute inset-x-16 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent" />
        </div>

        <div className="relative flex items-center justify-between gap-3 px-3 py-2 sm:px-4">
          <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-3">
            <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-amber-300/25 bg-black/35 shadow-[inset_0_0_18px_rgba(255,255,255,0.04),0_0_18px_rgba(0,212,255,0.12)] sm:h-16 sm:w-16">
              <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400/12 via-transparent to-cyan-400/12" />
              <img src="/newlogo.png" alt="Eternal MMO : Genesis" className="relative max-h-12 max-w-12 object-contain transition-transform duration-300 group-hover:scale-105 sm:max-h-14 sm:max-w-14" />
            </span>
            <span className="hidden min-w-0 lg:block">
              <span className="block text-sm font-bold uppercase tracking-[0.18em] text-white">Eternal MMO</span>
              <span className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-amber-300">
                <Sparkles size={13} />
                Genesis
              </span>
            </span>
          </Link>

          <div className="hidden flex-1 justify-center md:flex">
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/28 p-1 shadow-[inset_0_0_18px_rgba(255,255,255,0.035)]">
              {navItems.map(({ label, href, icon: Icon }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={label}
                    href={href}
                    className={`group relative flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-all duration-200 xl:px-4 ${
                      active
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-[0_0_18px_rgba(245,158,11,0.28)]'
                        : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'
                    }`}
                  >
                    <Icon size={16} className={active ? 'text-black' : 'text-cyan-200/80 group-hover:text-amber-300'} />
                    <span>{label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="hidden items-center justify-end gap-2 md:flex">
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                  className="flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-2 text-sm font-semibold text-cyan-100 shadow-[0_0_18px_rgba(0,212,255,0.08)] transition-all duration-200 hover:border-amber-300/35 hover:bg-amber-400/12 hover:text-amber-200"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-cyan-400/25 to-amber-400/25 text-white">
                    <User size={15} />
                  </span>
                  <span className="max-w-[128px] truncate">{username}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${showAdminDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showAdminDropdown && (
                  <div className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#080b12]/98 py-2 shadow-2xl backdrop-blur-xl">
                    <div className="border-b border-white/10 px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300">Account</p>
                      <p className="mt-1 truncate text-sm font-medium text-white">{username}</p>
                    </div>
                    <div className="py-1">
                      <MenuLink href="/profile" icon={User} label="My profile" onClick={() => setShowAdminDropdown(false)} />
                      {isSuperUser && <MenuLink href="/admin" icon={Settings} label="Admin panel" onClick={() => setShowAdminDropdown(false)} />}
                      {isSuperUser && <MenuLink href="/admin/paypal-ranking" icon={Trophy} label="PayPal Rewards" onClick={() => setShowAdminDropdown(false)} />}
                    </div>
                    <div className="border-t border-white/10 pt-1">
                      <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-300 transition-colors hover:bg-red-500/10">
                        <LogOut size={16} />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-slate-100 transition-all duration-200 hover:border-cyan-300/25 hover:bg-cyan-300/10 hover:text-cyan-100">
                  <LogIn size={16} />
                  Log in
                </Link>
                <Link href="/register" className="flex items-center gap-2 rounded-full border border-amber-300/50 bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-2.5 text-sm font-bold text-black shadow-[0_0_22px_rgba(245,158,11,0.28)] transition-all duration-200 hover:from-amber-300 hover:to-amber-400">
                  <UserPlus size={16} />
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.07] text-slate-100 transition-colors hover:border-amber-300/30 hover:bg-amber-400/12 hover:text-amber-200 md:hidden"
            aria-label="Open menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-[85] bg-black/80 backdrop-blur-sm md:hidden" onClick={() => setMenuOpen(false)} aria-hidden />
          <div className="fixed bottom-0 right-0 top-0 z-[90] flex w-full max-w-[340px] flex-col overflow-hidden border-l border-amber-300/18 bg-[#07090f] shadow-2xl md:hidden">
            <div className="relative border-b border-white/10 p-4">
              <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center opacity-10" aria-hidden />
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/12 via-transparent to-amber-400/14" aria-hidden />
              <div className="relative flex items-center justify-between gap-3">
                <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3">
                  <span className="grid h-14 w-14 place-items-center rounded-xl border border-amber-300/25 bg-black/40">
                    <img src="/newlogo.png" alt="Eternal MMO : Genesis" className="max-h-12 max-w-12 object-contain" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold uppercase tracking-[0.18em] text-white">Eternal MMO</span>
                    <span className="text-xs text-amber-300">Genesis</span>
                  </span>
                </Link>
                <button onClick={() => setMenuOpen(false)} className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.08] text-slate-200 hover:bg-white/[0.12]" aria-label="Close menu">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <p className="mb-3 px-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Menu</p>
              <div className="space-y-2">
                {navItems.map(({ label, href, icon: Icon }) => {
                  const active = isActive(href)
                  return (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-all ${
                        active
                          ? 'border-amber-300/35 bg-amber-400/15 text-amber-200'
                          : 'border-white/10 bg-white/[0.03] text-slate-200 hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]'
                      }`}
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-black/26">
                        <Icon size={20} />
                      </span>
                      <span className="flex-1 font-semibold">{label}</span>
                      <ChevronRight size={18} className="text-slate-500" />
                    </Link>
                  )
                })}
              </div>

              <p className="mb-3 mt-7 px-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Account</p>
              <div className="space-y-2">
                {isLoggedIn ? (
                  <>
                    <MobileAccountLink href="/profile" icon={User} label="My profile" onClick={() => setMenuOpen(false)} />
                    {isSuperUser && <MobileAccountLink href="/admin" icon={Settings} label="Admin panel" onClick={() => setMenuOpen(false)} />}
                    <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="flex w-full items-center gap-4 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3.5 text-left text-red-300">
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-red-500/10">
                        <LogOut size={20} />
                      </span>
                      <span className="font-semibold">Log out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <MobileAccountLink href="/login" icon={LogIn} label="Log in" onClick={() => setMenuOpen(false)} />
                    <Link href="/register" onClick={() => setMenuOpen(false)} className="flex items-center gap-4 rounded-xl border border-amber-300/45 bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3.5 text-black">
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-black/10">
                        <UserPlus size={20} />
                      </span>
                      <span className="flex-1 font-bold">Register</span>
                      <ChevronRight size={18} />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  )
}

function MenuLink({ href, icon: Icon, label, onClick }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 transition-colors hover:bg-amber-400/10 hover:text-amber-200">
      <Icon size={16} className="text-slate-500" />
      {label}
    </Link>
  )
}

function MobileAccountLink({ href, icon: Icon, label, onClick }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-slate-200">
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/[0.06]">
        <Icon size={20} />
      </span>
      <span className="flex-1 font-semibold">{label}</span>
      <ChevronRight size={18} className="text-slate-500" />
    </Link>
  )
}
